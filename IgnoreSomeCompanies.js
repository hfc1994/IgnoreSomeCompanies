// ==UserScript==
// @name         IgnoreSomeCompanies
// @namespace    https://github.com/hfc1994
// @version      0.1
// @description  try to ignore some companies that i do not want to!
// @author       枯木
// @match        https://search.51job.com/list/*
// @grant        none
// ==/UserScript==
// @todo 鼠标选词，右键加入到companies---右键菜单不能加东西，那么悬浮输入框的方式？？？
// @todo 根据第一条，有增加肯定需要删除
// @todo 在加入到companies之前，需要和已有的tag对比，查看是否有包含或被包含的关系
// @todo 被忽略的条目鼠标悬浮可以半透明显示（参考-眼不见心不烦）
// @todo 智联招聘和前程无忧分别适配
// @todo .ISC_keyword布局和点击删除
// @todo companies需要大小限制，限制50个关键字

let companies = []

// 初始化，用来读取localStorage
// 存储格式key:companies,value:['','']
function init() {
    appendStyle()
    appendFloatDiv()
    try {
        companies = JSON.parse(window.localStorage.getItem('companies'))
        if (companies === null || companies === undefined || companies.length === 0) {
            console.warn('页面暂无需要过滤的数据')
            return
        } else {
            run()
        }
    } catch(err) {
        console.error(err)
    }
}

function run() {
    let compDivs = document.querySelectorAll('.dw_table .el');
    compDivs.forEach((item) => {
        if (alreadyBeIgnored(item)) {
            return
        }
        let cName = item.getElementsByClassName('t2')[0].textContent.trim()
        if (isIgnoreCompany(cName)) {
            console.log('匹配到：' + cName)
            handleTargetNode(item, cName)
        }
    })
}

// 添加一些全局样式
function appendStyle() {
    // 需要被忽略的节点
    buildStyle('.ISC_ignoreNode{height:30px !important;background-color:#ffe8cd !important;}')
    // 需要被忽略的子节点
    buildStyle('.ISC_ignoreChildNode{display:none !important;}')
    // 新添加的节点
    buildStyle('.ISC_appendNode{font-size: 10px;text-align: center;margin-top: -5px;}')
    // toolbox节点里面的
    buildStyle('#ISC_info {position: fixed;bottom: 126px;margin-left: 1042px;text-align: center;padding-top: 5px;color: #ffffff;height: 48px;width: 48px;background-color: rgb(80, 210, 255)}')
    buildStyle('#ISC_input {position: fixed;bottom: 182px;margin-left: 890px;background-color: rgb(80, 210, 255, 0.5);height: 30px;width: 200px;z-index: 10;}')
    buildStyle('#ISC_content {position: fixed;bottom: 215px;margin-left: 890px;background-color: rgba(80, 210, 255, 0.5);height: 150px;width: 200px;z-index: 10;}')
    buildStyle('.ISC_keyword {display: inline-block;background-color: #cdcdcd}')
}

// 根据给定内容构造样式
function buildStyle(content) {
    let newStyle = document.createElement('style')
    newStyle.type = 'text/css'
    newStyle.innerHTML = content
    document.head.appendChild(newStyle)
}

// 是否是需要被忽略的
function isIgnoreCompany(cName) {
    for (let i = 0; i < companies.length; i++) {
        let ignoreName = companies[i]
        if (cName === ignoreName || cName.indexOf(ignoreName) !== -1) {
            return true
        }
    }
    return false
}

// 是否已经被过滤过了,true为已经被过滤了
function alreadyBeIgnored(node) {
    for (let i=0; i<node.classList.length; i++) {
        if ('ISC_ignoreNode' === node.classList[i]) {
            return true
        }
    }
    return false
}

// 处理需要被忽略的目标节点
function handleTargetNode(node, name) {
    node.classList.add('ISC_ignoreNode')
    for (let j=0; j<node.children.length; j++) {
        node.children[j].classList.add('ISC_ignoreChildNode')
    }
    appendNewChildNode(node, name)
}

// 被忽略的节点上增加一个div，用于显示忽略信息
function appendNewChildNode(node, name) {
    let div = document.createElement('div')
    div.classList.add('ISC_appendNode')
    div.onclick = nodeToDisplay
    div.innerText = '被忽略的公司 -> ' + name
    node.appendChild(div)
}

// 把被忽略的节点给恢复
function nodeToDisplay(event) {
    event.target.parentNode.classList.remove('ISC_ignoreNode')
    let children = event.target.parentNode.children
    // HTMLCollection没有forEach
    // appendNode是append上去的，是在最后一个
    for (let i=0; i<children.length; i++) {
        if (children[i].classList.contains('ISC_ignoreChildNode')) {
            children[i].classList.remove('ISC_ignoreChildNode')
        } else if (children[i].classList.contains('ISC_appendNode')) {
            children[i].remove()
        }
    }
}

// 添加toolbox
function appendFloatDiv() {
    let toolbox = document.createElement('div')
    toolbox.id = 'ISC_toolbox'
    let content = document.createElement('div')
    content.id = 'ISC_content'
    content.style = 'display: none;'
    let input = document.createElement('div')
    input.id = 'ISC_input'
    input.style = 'display: none;'
    input.innerHTML = '<input id="filterInput" placeholder="过滤的关键字" type="text"/><button id="filterButton" type="button">添加</button>'
    let info = document.createElement('div')
    info.id = 'ISC_info'
    info.innerHTML = '<span>添加<br/>过滤</span>'
    info.onclick = function() {
        // 切换显示与否
        let obj1 = document.getElementById('ISC_input')
        let obj2 = document.getElementById('ISC_content')
        if (obj1.style.display === 'none') {
            obj1.style.display = 'block'
            obj2.style.display = 'block'
        } else {
            obj1.style.display = 'none'
            obj2.style.display = 'none'
        }
    }

    toolbox.appendChild(content)
    toolbox.appendChild(input)
    toolbox.appendChild(info)

    document.getElementById('resultList').append(toolbox)

    document.getElementById('filterButton').onclick = function () {
        let keyword = document.getElementById('filterInput').value.trim()
        let status = checkAndModifiedArray(keyword)
        if (status) {
            modifyLocalStorage()
            document.getElementById('ISC_content').appendChild(buildContentChildNode(keyword))
            // 在content中显示该关键字
        } else {
            alert('关键字' + keyword + '已经存在，或者已经存在比它更详细的关键字了')
        }

        document.getElementById('filterInput').value = ''
    }
}

// 检查str是否已经在companies中存在，或者str是否包含或被包含于companies的某个值
// return true 表示之前没有或其是一个更具体的值，现在已经添加进去了
// return false 表示之前就有，或已有比其更具体值的存在
function checkAndModifiedArray(str) {
    if (companies === null) {
        companies = []
    }
    let len = companies.length
    for (let i=0; i<len; i++) {
        if (str === companies[i]) {
            return false
        } else if (companies[i].indexOf(str) !== -1) {
            // str比companies[i]的值更具体，那么就需要用str替换对应的值
            companies[i] = str
            return true
        } else if (str.indexOf(companies[i]) !== -1) {
            return false
        }
    }

    companies.push(str)
    return true
}

function modifyLocalStorage() {
    window.localStorage.setItem('companies', JSON.stringify(companies))
    run()
}

// content区域里面的keyword节点
function buildContentChildNode(val) {
    let childNode = document.createElement('div')
    childNode.classList.add('ISC_keyword')
    childNode.textContent = val

    return childNode
}

// 入口函数
init()