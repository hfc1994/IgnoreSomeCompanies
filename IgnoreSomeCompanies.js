// ==UserScript==
// @name         IgnoreSomeCompanies
// @namespace    https://github.com/hfc1994
// @version      0.1
// @description  try to take over the world!
// @author       kumu
// @match        https://search.51job.com/list/*
// @grant        none
// ==/UserScript==
// @todo 鼠标选词，右键加入到ignoreList---右键菜单不能加东西，那么悬浮输入框的方式？？？
// @todo 根据第一条，有增加肯定需要删除
// @todo 在加入到ignoreList之前，需要和已有的tag对比，查看是否有包含或被包含的关系
// @todo 被忽略的条目鼠标悬浮可以半透明显示（参考-眼不见心不烦）
// @todo 智联招聘和前程无忧分别适配

const ignoreList = ['白桃', '蓝鸽', '品茗', '阿里巴巴','恒生电子','中通文博','玖道','中软','网新','优创','希瑞亚斯']
let comArray = []

// 初始化，用来读取localStorage
// 存储格式key:companies,value:['','']
function init() {
    try {
        comArray = JSON.parse(window.localStorage.getItem('companies'))
        if (comArray === null || comArray === undefined || comArray.length === 0) {
            console.warn('页面暂无需要过滤的数据')
            appendStyle()
            appendInputFloatDiv()
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
    buildStyle('#ISC_input {position: fixed;bottom: 182px;margin-left: 890px;background-color: rgb(80, 210, 255, 0.5);height: 30px;width: 200px;display: none;z-index: 10;}')
    buildStyle('#ISC_content {position: fixed;bottom: 215px;margin-left: 890px;background-color: rgba(80, 210, 255, 0.5);height: 150px;width: 200px;display: none;z-index: 10;}')
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
    for (let i = 0; i < ignoreList.length; i++) {
        let ignoreName = ignoreList[i]
        if (cName === ignoreName || cName.indexOf(ignoreName) !== -1) {
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
function appendInputFloatDiv() {
    let toolbox = document.createElement('div')
    toolbox.id = 'ISC_toolbox'
    let content = document.createElement('div')
    content.id = 'ISC_content'
    let input = document.createElement('div')
    input.id = 'ISC_input'
    input.innerHTML = '<input id="filterInput" placeholder="过滤的关键字" type="text"/><button id="filterButton" type="button">添加</button>'
    let info = document.createElement('div')
    info.id = 'ISC_info'
    info.innerHTML = '<span>添加<br/>过滤</span>'
    info.onclick = function() {
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
        let status = checkAndModifiedArray(comArray, keyword)
        if (status) {
            // 在content中显示该关键字
        } else {
            alert('关键字' + keyword + '已经存在，或者已经存在比它更详细的关键字了')
        }

        document.getElementById('filterInput').value = ''
    }
}

// 检查str是否已经在array中存在，或者str是否包含或被包含于array的某个值
// return true 表示之前没有或其是一个更具体的值，现在已经添加进去了
// return false 表示之前就有，或已有比其更具体值的存在
function checkAndModifiedArray(array, str) {
    let len = sourceArray.length
    for (let i=0; i<len; i++) {
        if (str === array[i]) {
            return false
        } else if (array[i].indexOf(str) !== -1) {
            // str比array[i]的值更具体，那么就需要用str替换对应的值
            array[i] = str
            return true
        } else if (str.indexOf(array[i])) {
            return false
        }
    }

    array.push(str)
    return true
}

// type 可能是增加关键字导致的修改，也可能是因为删除关键字
function modifyLocalStorage(array, type) {
    window.localStorage.setItem('companies', JSON.stringify(array))
    // @todo 页面的过滤情况更新
}

// 入口函数
init()