// 实现简单的虚拟dom 
// Author: Amaz
// 2020-3-11


// 核心函数

// 配置flag映射
const vNodeFlag = {
    HTML: 'HTML',
    TEXT: 'TEXT',
    COMPONENT: 'COMPONENT'
}
const childrenFlags = {
    SINGLE: 'SINGLE',
    MULTIPLE: 'MULTIPLE',
    TEXT: 'TEXT',
    EMPYT: 'EMPYT'
}

// 创建虚拟dom
function createVirtualDom(tag, data, children) {
    let vNode = {tag, data, children, el: null}
    // 首先根据tag 判断节点的类型
    if (typeof tag === 'string') {
        vNode.flag = vNodeFlag.HTML
    } else if (typeof tag === 'function') {
        vNode.flag = vNodeFlag.COMPONENT
    } else {
        vNode.flag = vNodeFlag.TEXT
    }
    // 配置子元素
    if (children) {
        if (Array.isArray(children)) {
            const length = children.length
            if (length >= 1) {
                vNode.childrenFlag = childrenFlags.MULTIPLE
            } else {
                vNode.childrenFlag = childrenFlags.SINGLE
            }
        } else {
            vNode.childrenFlag = childrenFlags.TEXT
        }
    } else {
        vNode.childrenFlag = childrenFlags.EMPYT
    }
    // 返回虚拟dom
    return vNode
}

// 渲染虚拟dom
function render(node, container) {
    const { tag, children, childrenFlag } = node
    const element = document.createElement(tag)
    node.el = container
    if (childrenFlag !== childrenFlag.EMPYT) {
        if (childrenFlag !== childrenFlags.TEXT) {
            const length = children.length
            for (let i = 0 ; i < length; i++) {
                children[i].el = element
                // 递归 渲染所有的子元素
                render(children[i], element)
            }
        } else {
            element.appendChild(document.createTextNode(children))
        }
    }
    console.log(node)
    container.appendChild(element)
}

// 辅助函数

function getElementNode() {}
function getTextNode() {}

