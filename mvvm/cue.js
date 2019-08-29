class Cue {
    constructor(options) {
        // 拿到根元素
        this.$el = options.el
        // 拿到数据
        this.$data = options.data
        // 判断根元素是否存在
        if (this.$el) {
            // 如果$el存在 那么就开始编译
            new Compile(this.$el, this)
        }
    }
}