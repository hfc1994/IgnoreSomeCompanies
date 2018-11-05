// @todo 鼠标选词，右键加入到ignoreList
// @todo 在加入到ignoreList之前，需要和已有的tag对比，查看是否有包含或被包含的关系
// @todo 被忽略的条目鼠标悬浮可以半透明显示（参考-眼不见心不烦）
// @todo 智联招聘和前程无忧分别适配
const ignoreList = ['白桃', '蓝鸽', '品茗', '阿里巴巴']

function run() {
    this.appendStyle()
    let compDivs = document.querySelectorAll('.dw_table .el');
    compDivs.forEach((item) => {
        let cName = item.getElementsByClassName('t2')[0].textContent.trim()
        if (this.isIgnoreCompany(cName)) {
            console.log('匹配到：' + cName)
            this.handleTargetNode(item, cName)
        }
    })
}

// 添加一些全局样式
function appendStyle() {
    // 需要被忽略的节点
    this.buildStyle('.ignoreNode{height:30px !important;background-color:#ffe8cd !important;}')
    // 需要被忽略的子节点
    this.buildStyle('.ignoreChildNode{display:none !important;}')
    // 新添加的节点
    this.buildStyle('.appendNode{font-size: 10px;text-align: center;margin-top: -5px;}')
}

// 根据给定内容构造样式
function buildStyle(content) {
    let newStyle = document.createElement('style')
    newStyle.type = 'text/css'
    newStyle.innerHTML  = content
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
    node.classList.add('ignoreNode')
    for (let j=0; j<node.children.length; j++) {
        node.children[j].classList.add('ignoreChildNode')
    }
    this.appendNewChildNode(node, name)
}

// 被忽略的节点上增加一个div，用于显示忽略信息
function appendNewChildNode(node, name) {
    let div = document.createElement('div')
    div.classList.add('appendNode')
    div.onclick = this.nodeToDisplay
    div.innerText = '被忽略的公司 -> ' + name
    node.appendChild(div)
}

// 把被忽略的节点给恢复
function nodeToDisplay(event) {
    this.parentNode.classList.remove('ignoreNode')
    let children = this.parentNode.children 
    // HTMLCollection没有forEach
    // appendNode是append上去的，是在最后一个
    for (let i=0; i<children.length; i++) {
        if (children[i].classList.contains('ignoreChildNode')) {
            children[i].classList.remove('ignoreChildNode')
        } else if (children[i].classList.contains('appendNode')) {
            children[i].remove()
        }
    }
}