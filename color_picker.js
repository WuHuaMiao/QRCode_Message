//属性访问表达式优先级高于“=”号

;(function() {
   
    //色相
    function Main(canvas, config) {
        this.STEP = config.length || 7; //颜色的步长，用以控制取色器色带的长度
        this.RANGE = 255 * 6 / this.STEP; //由于色相有6个变化过程（红到黄，黄到绿，绿到青，青到蓝，蓝到紫，紫到红），所以总长度是 255×6/步长

        this.canvas = typeof canvas == 'object' ? canvas : document.getElementById(canvas);
        this.ctx = this.canvas.getContext('2d');
        this.outsideClickAction = function() {}; //不属于该类所控制的点击事件，先将它设为空函数

        /* init */
        this.width = this.canvas.width = this.RANGE;
        this.height = this.canvas.height = 15;
        this.x = 0; //鼠标在该canvas上点击位置的横坐标，用以计算颜色值
        this.currentColor = config.default || 'rgb(0, 0, 0)'; //储存当前颜色，初始值为用户未选择颜色时的默认值，该默认值允许自行设定

        this.drawColorBlock();
    }

    Main.prototype = {
        constructor: Main,

        //绘制色带
        drawColorBlock: function() {
            var pWidth = 1, //每个颜色的绘制宽度
                RANGE = this.RANGE;
            for(var i=0; i<RANGE; i++) {
                this.ctx.fillStyle = this.getStyle(i);
                this.ctx.fillRect(i*pWidth, 0, pWidth, this.height);
            }
        },

        //获取色带背景颜色
        getStyle: function (i) {
            var STEP = this.STEP,
                RANGE = 255 / STEP;

            var redToYellow = RANGE ,
                yellowToGreen = Math.floor(RANGE * 2),
                greenToCyan =  Math.floor(RANGE * 3),
                cyanToBlue = Math.floor(RANGE * 4),
                blueToPink = Math.floor(RANGE * 5),
                pinkToRed = Math.floor(RANGE * 6);
            
            var rgb;
            
            switch(true) {
                case i <= redToYellow:
                    rgb = 'rgb(255,'+ i*STEP +',0)'; break;
                case i <= yellowToGreen:
                    rgb = 'rgb('+ (yellowToGreen-i)*STEP +',255,0)'; break;
                case i <= greenToCyan:
                    rgb = 'rgb(0,255,'+ (i-yellowToGreen)*STEP+')'; break;
                case i <= cyanToBlue:
                    rgb = 'rgb(0,'+ (cyanToBlue-i)*STEP + ',255)'; break;
                case i <= blueToPink:
                    rgb = 'rgb('+ (i-cyanToBlue)*STEP + ',0,255)'; break;
                case i <= pinkToRed:
                    rgb = 'rgb(255,0,'+ (pinkToRed-i)*STEP +')'; break;  
            }
            return rgb;
        },

        clickAction: function() {
            this.drawColorBlock();
            this.currentColor = this.getCurrentColor();
            this.outsideClickAction();
        },

        getCurrentColor: function() {
            var origin = this.x * this.STEP;
            var value = origin % 255,
                position = Math.floor(origin / 255);
            var rgb;
            switch(position) {
                case 0:
                    rgb = 'rgb(255,'+ value +',0)';
                    break;
                case 1:
                    rgb = 'rgb('+ (255-value) +',255,0)';
                    break;
                case 2:
                    rgb = 'rgb(0,255,'+ value +')';
                    break;
                case 3:
                    rgb = 'rgb(0,'+ (225-value) +',255)';
                    break;
                case 4:
                    rgb = 'rgb('+ value +',0,255)'; 
                    break;
                case 5:
                    rgb = 'rgb(255,0,'+ (255-value) +')';
            }
            return rgb;
        },

        returnData: function() {
            return {
                currentColor: this.currentColor,
                width: this.width,
                height: this.height
            };
        }
    }

    function Sub(canvas, originColor, width, height, model) {
        this.canvas = typeof canvas == 'object' ? canvas : document.getElementById(canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.baseColor = null;
        this.x = 0;
        this.currentColor = originColor;
        this.outsideClickAction = function() {};
        this.model = model;

        /* init */
        this.width = this.canvas.width = width;
        this.height = this.canvas.height = height;

        this.getBaseColor(originColor);
        this.drawColorBlock();
    }
    Sub.prototype = {
        constructor: Sub,
        
        getBaseColor: function(originColor) {
            this.baseColor = originColor.split(',').map(function(mem) {
                return parseInt(mem.replace(/[^\d+]/g, ''));
            });
        },

        drawColorBlock: function(originColor) {
            if(originColor)
                this.getBaseColor(originColor);
            
            var r, g, b, rgb, _i;
            for(var i=0; i<=this.width; i++) {
                _i = this.modelHandle(this.map(i, 0, this.width));
                r = this.baseColor[0] -_i;
                g = this.baseColor[1] -_i;
                b = this.baseColor[2] -_i;
                rgb = this.ctx.fillStyle= 'rgb('+r+','+g+','+b+')';
                this.ctx.fillRect(i, 0, 1,this.height);
            }
            //this.currentColor
        },

        getCurrentColor: function() {
            var origin = this.modelHandle(this.map(this.x, 0, this.width)); 
            var r, g, b, rgb;
            r = this.filterNeg(this.baseColor[0] - origin);
            g = this.filterNeg(this.baseColor[1] - origin);
            b = this.filterNeg(this.baseColor[2] - origin);
            rgb = 'rgb('+r+','+g+','+b+')';

            return rgb;
        },

        modelHandle: function(num) {
            if(this.model == 'brightness')
                return num;
            else if(this.model == 'saturation')
                return -num;
        },

        filterNeg: function(num) {
            if(num < 256)
                return num > 0 ? num : 0;
            return 255;
        },

        clickAction: function() {
            this.drawColorBlock();
            this.currentColor = this.getCurrentColor();
            this.outsideClickAction();
        },

        map: function(input, b_head, b_tail, a_head, a_tail) {
            var a_head = a_head || 0,
                a_tail = a_tail || 255;
            if(input > b_tail || input < b_head)
                return null;
            return Math.floor((input - b_head) / (b_tail - b_head) * (a_tail - a_head) + a_head);
        }
    }

    function Show(canvas, currentColor, width, height, display) {
        this.canvas = typeof canvas == 'object' ? canvas : document.getElementById(canvas);
        this.display = typeof display == 'object' ? display : document.getElementById(display);
        this.ctx = this.canvas.getContext('2d');

        this.width = this.canvas.width = width / 2;
        this.height = this.canvas.height = height;

        this.currentColor = currentColor;

        this.drawColor(this.currentColor)
    }
    Show.prototype = {
        constructor: Show,

        drawColor: function(color) {
            this.ctx.fillStyle = this.currentColor = color;
            this.ctx.fillRect(0, 0, this.width, this.height);

            if(this.display)
                this.display.innerHTML = this.currentColor;
        }
    }

    function ColorPicker(config) {
        this.main = new Main(config.hueCanvas, {
            length: config.length,
            default: config.defaultColor
        });
        var data = this.main.returnData();
        this.sub = new Sub(config.brightnessCanvas, data.currentColor, data.width, data.height, 'brightness');
        this.third = new Sub(config.saturationCanvas, data.currentColor, data.width, data.height, 'saturation');
        this.show = new Show(config.selectedCanvas, data.currentColor, data.width, data.height, config.display);
        this.currentColor = data.currentColor;

        this.bindCanvasAction();

    }
    ColorPicker.prototype = {
        constructor: ColorPicker,

        bindCanvasAction: function() {
            var canvasArr = [this.main.canvas, this.sub.canvas, this.third.canvas],
                objArr = [this.main, this.sub, this.third];

            for(var i=0; i<objArr.length; i++) {
                this.canvasAction(canvasArr[i], objArr[i]);
            }

            this.main.outsideClickAction = function() {
                this.sub.drawColorBlock(this.sub.currentColor = this.main.currentColor); 
                this.third.drawColorBlock(this.third.currentColor = this.sub.currentColor);
            }.bind(this);

            this.sub.outsideClickAction = function() {
                this.third.drawColorBlock(this.third.currentColor = this.sub.currentColor);
            }.bind(this);
        },

        canvasAction: function(canvas, obj) {
            var position = canvas.getBoundingClientRect();
            var x1, y1;
            var _this = this;

            canvas.onmousemove = function(event) {
                var e = event || window.event;
                x1 = e.clientX;
                this.x = x1 - position.left;
            }.bind(obj);

            canvas.addEventListener('click', function() {
                this.clickAction();
                _this.mark.call(this);
                _this.show.drawColor(_this.currentColor = _this.third.currentColor);
            }.bind(obj));
        },

        mark: function() {
            var width = 4;
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(this.x-width/2, 0, width, this.height);
        },

        getCurrentColor: function() {
            return this.currentColor;
        }
    }

    window.ColorPicker = ColorPicker;
})()


