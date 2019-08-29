class Compile {
    constructor(el, vm) {
        this.vm = vm
        // 判断el是字符串还是dom结构
        this.$el = this.isElementNode(el) ? el : document.querySelector(el)
        // 如果$el存在 那么就开始编译
        if (this.$el) {
            // 编译分三个步骤
            // 1.将根元素中的节点存放到fragment中操作 以提高性能
            const fragment = this.node2Fragment(this.$el)
            // 2.操作fragment中的元素， 替换其中需要替换的值
            this.complite(fragment)
            // 3.将fragment中的元素再放回页面中
            this.$el.appendChild(fragment)
        }

    }
    /**
     * 核心方法
     */
    compliteElement(element, vm) {
        // 获取到dom元素的所有属性
        let attrs = element.attributes, exp
        Array.from(attrs).forEach((item) => {
            // 判断是否含有‘v-’ 这种指令
            if (item.name.includes('v-')) {
                exp = item.value
                // 找到指令绑定的值之后 再去data中寻找对应的值
                // CompileUtils 是一个方法的集合， 用于代码解耦
                // 因为我们不确定这个dom上绑定的是什么指令，需要通过属性来判断
                const [, type] = item.name.split('-')
                CompileUtils[type](element, CompileUtils.getVal(vm.$data, exp))
            }
        })
    }
    compliteText(element, vm) {
        // 如果是文本节点 我们需要判断节点中是否含有 {{}}
        // 首先我们取出文本节点的内容
        const exp = element.textContent
        const reg = /\{\{([^}]+)\}\}/g
        if (reg.test(exp)) {
            // 这里说明找到了 {{}} 我们接下来要做的 就是做替换 连同{{}} 一起替换
            CompileUtils['text'](element, vm, exp)
        }
    }
    complite(fragment) {
        // 这里的fragment是一个dom对象，我们需要先将dom对象中的子节点(childNodes)全部都拿出来
        const nodeList = fragment.childNodes
        // 这里的nodeList是元素集合 是个伪数组 要将他转换成真数组
        Array.from(nodeList).forEach((element) => {
            // 如果当前元素是dom节点的话
            if (this.isElementNode(element)) {
                // 进行dom节点的编译
                this.compliteElement(element, this.vm)
            } else {
                // 进行文本节点的编译
                this.compliteText(element, this.vm)
            }
            // 这里需要考虑嵌套dom的情况 所以我们需要做一下递归
            this.complite(element)
        })
    }



    /**
     * 辅助方法
     */

    isElementNode(node) {
        // 通过nodeType判断是否是dom元素
        return node.nodeType === 1
    }
    node2Fragment(node) {
        let firstChild, fragment = document.createDocumentFragment()
        while(firstChild = node.firstChild) {
            fragment.appendChild(firstChild)
        }
        return fragment
    }
}

// 这里定义一些公共方法，进行解耦
CompileUtils = {
    getVal(data, exp) {
        // 这里是一个坑 如果我们v-model绑定的是一个简单的值 类似于messsage 我们可以这样写
        // element.value = vm.$data[exp]
        // 但是如果绑定的是一个对象中的值， 那就不能这么写了假如 message.a 总不能写成
        //  element.value = vm.$data[message.a]
        // 这里需要特殊处理一下
        // 首先我们先将exp通过 . 转换成数组
        const list = exp.split('.')
        // 之后通过reduce方法 找到我们想要的值
        return list.reduce((prev, next) => {
            return prev[next]
        }, data)
    },
    model(node, value) {
        this.updater['modelUpdater'] && this.updater['modelUpdater'](node, value)
    },
    text(node, vm, exp) {
        const value = exp.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            // replace 第一个参数是正则， 第二个参数是函数 函数中第一个参数是需要替换的字符串， 第二个参数是
            // 正则匹配出的字符串
            return this.getVal(vm.$data, arguments[1])
        })
        this.updater['textUpdater'] && this.updater['textUpdater'](node, value)
    },
    updater: {
        modelUpdater(node, value) {
            node.value = value
        },
        textUpdater(node, value,) {
            node.textContent = value
        }
    }
}