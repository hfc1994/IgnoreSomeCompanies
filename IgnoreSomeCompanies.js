var ignoreList = ['白桃', '青文古雪', '品茗']

// 是否是需要被忽略的
function isIgnoreCompany(cName) {
    for (var i = 0; i < ignoreList.length; i++) {
        var ignoreName = ignoreList[i].trim() 
        if (cName === ignoreName || cName.indexOf(ignoreName) !== -1) {
            return true
        }
    }
    return false
}

// 处理需要被忽略的目标子节点
function handleTargetNode(node, name) {
    for (var j=0; j<node.children.length; j++) {
        // node.children[j].style.display = 'none'
        node.children[j].classList.add('ignoreChildNode')
    }
    this.appendNewChildNode(node, name)
}

// 被忽略的节点上增加一个div，用于显示忽略信息
function appendNewChildNode(node, name) {
    var div = document.createElement('div')
    div.classList.add('appendNode')
    div.innerText = '被忽略的->' + name
    // div.style.backgroundColor = 'red'
    node.appendChild(div)
}

// 被忽略的节点以及子节点的两个样式
function appendStyle() {
    var ignoreStyle = document.createElement('style')
    ignoreStyle.type = 'text/css'
    ignoreStyle.innerHTML  = '.ignoreNode{height:30px !important;background-color:#ffe8cd !important;}'
    document.head.appendChild(ignoreStyle)

    var childIgnoreStyle = document.createElement('style')
    childIgnoreStyle.type = 'text/css'
    childIgnoreStyle.innerHTML  = '.ignoreChildNode{display:none !important;}'
    document.head.appendChild(childIgnoreStyle)

    // var appendNodeStyle = document.createElement('style')
    // appendNodeStyle.type = 'text/css'
    // appendNodeStyle.innerHTML = '.appendNode{}'
}

function run() {
    this.appendStyle()
    var compDivs = document.querySelectorAll('.dw_table .el');
    compDivs.forEach((item, index, compDivs) => {
        var cName = item.getElementsByClassName('t2')[0].textContent
        if (this.isIgnoreCompany(cName)) {
            console.log('匹配到：' + cName)
            item.classList.add('ignoreNode')
            this.handleTargetNode(item, cName)
        }
    })
}

