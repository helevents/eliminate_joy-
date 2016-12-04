$(window).on('scroll.elasticity', function (e){
    e.preventDefault();
}).on('touchmove.elasticity', function(e){
    e.preventDefault();
});

if (document.querySelector('#canvas-container') && document.querySelector('.time-score cite')) {
    const container = document.querySelector('#canvas-container');
    const timeScore = document.querySelector('.time-score cite');
    
    $(document).ready(() => {

        const conNum = {
            width: parseInt((window.getComputedStyle(container, null).getPropertyValue('width')).slice(0, -3)) - 12, 
            height: parseInt((window.getComputedStyle(container, null).getPropertyValue('height')).slice(0, -3)) - 12
        };

        const pub = {
            canvas: document.getElementById('canvas'),
            ctx: document.getElementById('canvas').getContext('2d'),
            //第一行图片的数量
            xNum: 6,
            //第一列图片的数量
            yNum: 8,
            imgWidth: (conNum.width) / 6,
            imgHeight: (conNum.height) / 8,
            //当图片的移动位移超过 halfwidth 时, 会进行上下左右的移动
            halfWidth: 20,
            allImgs: document.querySelector('.allimg').children,
            clickedImg: document.querySelector('.img-clicked').children,
            disslovedImg: document.querySelector('.img-dissloved').children,
            clickedImgIndex: 0
        }

        pub.canvas.width = conNum.width;
        pub.canvas.height = conNum.height;

        let pubdata = {
            moveFlag: false,
            clickedFlag: false,
            score: 0,
            //移动位置不合理时 
            imgPlaceStay () {
                imgPlace = {
                    x: startInt.x,
                    y: startInt.y
                };
            },
        };

        //记录触发touchstart事件的位置
        let start = {};
        //将 触发touchstart事件的位置 设置为imgWidth的整数倍
        let startInt = {};
        //点击的图片 下一刻要去的地方
        let imgPlace = {};
        //存放页面上所有的图片信息
        let matrix = [];

        let ct = 0;

        class Stage {
            constructor () {
                this.ctx = pub.ctx,
                this.width = 280,
                this.height = 280
            }

            //每次消除小动物之后 刷新页面
            refresh () {
                this.ctx.clearRect(0, 0, this.width, this.height);
            }

            //游戏开始时 填充图片
            drawNewStage () {
                for (let i = 0; i <= pub.xNum-1; i++) {
                    matrix[i] = new Array();
                    for (let j = 0; j <= pub.yNum-1; j++) {
                        let len = pub.allImgs.length;
                        let index = Math.round(Math.random()*(len-1) + 0);
                        let animal = new Animal(pub.ctx, i*pub.imgWidth, j*pub.imgHeight, pub.allImgs[index], false, true);

                        matrix[i][j] = animal;
                        animal.paint();
                    }
                }

                //动画部分
                // for (let i = 0; i <= 0; i++) {
                //     for (let j = 0; j <= 0; j++) {
                //         matrix[i][j].setY(matrix[i][j].getY() - (240 - j*pub.imgHeight));
                //         console.log(matrix[i]);
                //         var timer = setInterval(function () {
                //             matrix[i][j].fall();
                //             if (matrix[i][j].getY() > i*pub.imgHeight) {
                //                 clearInterval(timer);
                //             }
                //         }, 10);
                //     }
                // }
            }

            //计时模式图案填充
            drawTimeStage () {
                //left-top
                let k = 0; 
                matrix[k][k].toClick = false;
                matrix[k+1][k].toClick = false;
                matrix[k][k+1].toClick = false;

                //right-top
                let m = pub.xNum - 1;
                matrix[m][k].toClick = false;
                matrix[m-1][k].toClick = false;
                matrix[m][k+1].toClick = false;

                //left-bottom
                let n = pub.yNum - 1;
                matrix[k][n].toClick = false;
                matrix[k][n-1].toClick = false;
                matrix[k+1][n].toClick = false;

                //right-bottom
                matrix[m][n].toClick = false;
                matrix[m-1][n].toClick = false;
                matrix[m][n-1].toClick = false;

                matrix.forEach( function(element, index) {
                    element.forEach( function(ele, ind) {
                        if (!ele.toClick) {
                            ele.refresh();
                        }
                    });
                });
            }

            //对 存入matrix 的图片进行重绘
            drawStage () {
                for (let i = 0; i <= pub.xNum-1; i++) {
                    for (let j = 0; j <= pub.yNum-1; j++) {
                        if (matrix[i][j].toClick) {
                            matrix[i][j].paint();
                        }
                    }
                }
            }
            
            //随机重绘 matrix[i][k]区域 图片
            drawNewImg (matrix, i, k) {
                let len = pub.allImgs.length;
                let index = Math.round(Math.random()*(len-1) + 0);
                matrix[i][k].img = pub.allImgs[index];

                return index;
            }

            //判断 y方向 是否有 count+1 个可消去的小动物
            findYSameImg(count, i, j) {
                if (matrix[i][j+count]) {
                    if (matrix[i][j+count].toClick) {
                        for (var z = 0; z < count; z++) {
                            //如果下一张图片不为空
                            if (matrix[i][j+z+1]) {
                                if (matrix[i][j+z].img !== matrix[i][j+z+1].img) {
                                    break;
                                }
                            } 
                        }
                        if (z === count) {
                            //为可以消去的图片把toRemove改成true
                            for (let k = 0; k <= count; k++) {
                                matrix[i][j+k].toRemove = true;
                            }
                            return z;
                        }

                        return false;
                    } 
                }
            }

            //判断 x方向 是否有 count+1 个可消去的小动物
            findXSameImg(count, i, j) {
                if (i < pub.xNum - count) {
                    if (matrix[i+count][j]) {
                        if (matrix[i+count][j].toClick) {
                            for (var z = 0; z < count; z++) {
                                if (matrix[i+z+1][j]) {
                                    if (matrix[i+z][j].img !== matrix[i+z+1][j].img) 
                                        break;
                                } 
                            }
                            if (z === count) {
                                //为可以消去的图片把toRemove改成true
                                for (let k = 0; k <= count; k++) {
                                    matrix[i+k][j].toRemove = true;
                                }
                                return z;
                            }

                            return false;
                        }
                    }
                }
            }

            //遍历所有图片, 为toRemove值为true的图片进行操作
            isDissloved () {
                matrix.forEach( function(element, index) {
                    element.forEach( function(e, i) {
                        if (e.toClick) {
                            // console.log('i = ', index, ', j = ', i);
                            for (let k = 4; k >= 2; k--) {
                                stage.findXSameImg(k, index, i);
                                stage.findYSameImg(k, index, i)
                            }
                                // console.log('11111');
                                // if (stage.findXSameImg(4, index, i)) {
                                //     pubdata.score += (4+1)*10;
                                //     e.dissloved();

                                    
                                //     //模仿图片下落的操作
                                //     if (i !== 0) {
                                //         //如果不是第一行的元素
                                //         for (let k = i-1; k >= 0; k--) {
                                //             matrix[index][k+1].img = matrix[index][k].img;
                                //         }
                                //         stage.drawNewImg(matrix, index, 0);
                                //     } else {
                                //         stage.drawNewImg(matrix, index, 0);
                                //     }

                                //     e.toRemove = false;

                                //     console.log(5);
                                //     console.log(pubdata.score);
                                // } else if (stage.findXSameImg(3, index, i)) {
                                //     pubdata.score += (3+1)*10;
                                //     e.dissloved();

                                //     console.log(4);
                                //     console.log(pubdata.score);
                                // } else if (stage.findXSameImg(2, index, i)) {
                                //     pubdata.score += (2+1)*10;
                                //     e.dissloved();

                                //     console.log(3);
                                //     console.log(pubdata.score);
                                // }

                                // if (stage.findYSameImg(4, index, i)) {
                                //     pubdata.score += (4+1)*10;
                                // } else if (stage.findYSameImg(3, index, i)) {
                                //     pubdata.score += (3+1)*10;
                                // } else if (stage.findYSameImg(2, index, i)) {
                                //     pubdata.score += (2+1)*10;
                                // }
                            // }
                        }

                        // console.log(pubdata.score);
                    });
                });
                
                //可以消去的图片 消去之前会发生的变化 (边界出现亮圆点)
                for (let i = 0; i < pub.xNum; i++) {
                    for (let j = 0; j < pub.yNum; j++) {
                        if (matrix[i][j].toClick) {
                            if (matrix[i][j].toRemove) {
                                matrix[i][j].dissloved();
                                ct++;
                            }
                        }
                    }
                }

                for (let i = 0; i < pub.xNum; i++) {
                    for (let j = 0; j < pub.yNum; j++) {
                        if (matrix[i][j].toClick) {
                            if (matrix[i][j].toRemove) {
                                //要等亮圆点出现之后, 再清除当前图片区域
                                setTimeout(function () {
                                    matrix[i][j].refresh();
                                }, 300);

                                //模仿图片下落的操作
                                if (j !== 0) {
                                    //如果不是第一行的元素
                                    for (let k = j-1; k >= 0; k--) {
                                        matrix[i][k+1].img = matrix[i][k].img;
                                    }
                                    stage.drawNewImg(matrix, i, 0);
                                } else {
                                    stage.drawNewImg(matrix, i, 0);
                                }

                                matrix[i][j].toRemove = false;
                            }
                        }
                    }
                }

                setTimeout(function () {
                    stage.drawStage();
                }, 500);

                //如果重新生成的图片中有可以消去的图片, 改变它们的toRemove值
                for (let i = 0; i < pub.xNum; i++) {
                    for (let j = 0; j < pub.yNum; j++) {
                        if (matrix[i][j].toClick) {
                            for (let k = 2; k <= 4; k++) {
                                stage.findXSameImg(k, i, j);
                                stage.findYSameImg(k, i, j);
                            }
                        }
                    }
                }   

                for (let i = 0; i < pub.xNum; i++) {
                    for (let j = 0; j < pub.yNum; j++) {
                        if (matrix[i][j].toClick) {
                            if (matrix[i][j].toRemove) {
                                return true;
                            }
                        }
                    }
                }
            }

            //每次点击之前, 将所有图片重置为没有 clickedImg 的图片
            rewriteClickedImg () {
                let clickedImg = Array.prototype.slice.call(pub.clickedImg);
                matrix.forEach( function(element, index) {
                    element.forEach( function(ele, ind) {
                        if (ele.toClick) {
                            clickedImg.forEach( function(e, i) {
                                if (element[ind].img === e) {
                                    element[ind].img = pub.allImgs[i];
                                }
                            });
                        }
                    });
                });
            }

            //获取当前图片在 allImg 中的index
            currentAllImgsIndex (ele) {
                let allImgs = Array.prototype.slice.call(pub.allImgs);
                let imgIndex = 0;
                let that = ele;

                allImgs.forEach(function(element, index) {
                    if (that.img === element) {
                        imgIndex = index;
                    }
                });

                return imgIndex;
            }

            //
            getScore () {
                pubdata.score = ct * 10;
                timeScore.innerHTML = pubdata.score;
            }


            //连续消去函数
            continueToDissloved () {
                //如果 新生成 的图片有可以消去的, 继续调用消去函数
                let timer = setInterval(function () {
                    let boolis = stage.isDissloved();

                    stage.getScore();

                    if (!boolis) {
                        clearInterval(timer);
                    }
                }, 1000);
            }

            //
            gameOver () {
                matrix.forEach( function(element, index) {
                    element.forEach( function(ele, ind) {
                        ele.toClick = false;
                    });
                });
            }
        }

        class Animal {
            constructor (ctx, x, y, img, toRemove, toClick) {
                this.ctx = ctx;
                this.x = x;
                this.y = y;
                this.img = img;
                this.toRemove = toRemove;
                this.toClick = toClick;
            }

            paint () {
                this.ctx.drawImage(this.img, this.x, this.y, pub.imgWidth, pub.imgHeight);
            }

            fall () {
                this.y += .5;
                stage.refresh();
                this.paint();
            }

            refresh () {
                this.ctx.clearRect(this.x, this.y, pub.imgWidth, pub.imgHeight);
            }

            //消去的时候图片会发生的变化
            dissloved () {
                let imgIndex = stage.currentAllImgsIndex(this);

                this.img = pub.disslovedImg[imgIndex];
                stage.drawStage();
            }

            //点击的时候图片发生的变化
            clicked () {
                let imgIndex = stage.currentAllImgsIndex(this);
                this.img = pub.clickedImg[imgIndex];

                stage.drawStage();
                return imgIndex;
            }
        }

        let stage = new Stage();

        stage.drawNewStage();
        stage.drawTimeStage();
        
        //调用消去函数
        stage.continueToDissloved();

        pub.canvas.addEventListener('touchstart', function(e) {
            pubdata.clickedFlag = false;
            var e = e || window.event;

            //保存点击图片时的位置
            start = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
            //转化为 图片宽度和高度 的整数倍
            startInt = {
                x: parseInt((start.x - this.offsetLeft) / pub.imgWidth) * pub.imgWidth,
                y: parseInt((start.y - this.offsetTop) / pub.imgHeight) * pub.imgHeight
            };


            pub.clickedImgIndex = matrix[startInt.x / pub.imgWidth][startInt.y / pub.imgHeight].clicked(); 
            //点击图片时会发生的
            stage.rewriteClickedImg();

            pubdata.clickedFlag = false;
        });

        pub.canvas.addEventListener('touchmove', function(e) {
            pubdata.moveFlag = true;
            var e = e || window.event;

            let mouse = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };

            //手指拖动图片向 水平 方向运动
            if (Math.abs(mouse.y - start.y) <= Math.abs(mouse.x - start.x)) {
                //鼠标向右移动
                if (mouse.x - start.x >= 0) {
                    //如果鼠标 向右 拖动图片移动的距离 超过 图片的halfwidth
                    if (mouse.x - start.x >= pub.halfWidth) {
                        imgPlace = {
                            x: startInt.x + pub.imgWidth,
                            y: startInt.y
                        };        
                    } else {
                        pubdata.imgPlaceStay();
                    }
                    //鼠标向左移动
                } else {
                    if (mouse.x - start.x <= -pub.halfWidth) {
                        imgPlace = {
                            x: startInt.x - pub.imgWidth,
                            y: startInt.y
                        };
                    } else {
                        pubdata.imgPlaceStay();
                    }
                } 
                //拖动图片向竖直方向运动
            } else {
                //鼠标向下移动
                if (mouse.y - start.y >= 0) {
                    //如果鼠标 向下 拖动图片移动的距离 超过 图片的halfwidth
                    if (mouse.y - start.y >= pub.halfWidth) {
                        imgPlace = {
                            x: startInt.x,
                            y: startInt.y + pub.imgHeight
                        }                    
                    } else {
                        pubdata.imgPlaceStay();
                    }
                } else {
                    if (start.y - mouse.y >= pub.halfWidth) {
                        imgPlace = {
                            x: startInt.x,
                            y: startInt.y - pub.imgHeight
                        };
                    } else {
                        pubdata.imgPlaceStay();
                    }
                }
            }
        });

        pub.canvas.addEventListener('touchend', function (e) {
            pubdata.clickedFlag = false;

            let s = {
                x: startInt.x / pub.imgWidth, 
                y: startInt.y / pub.imgHeight
            };
            let i = {
                x: imgPlace.x / pub.imgWidth, 
                y: imgPlace.y / pub.imgHeight
            };

            //点击完成后 需要将 clickedImg 换回原图片
            matrix[s.x][s.y].img = pub.allImgs[pub.clickedImgIndex];

            if (pubdata.moveFlag) {
                //如果两张图片不相同
                if (matrix[s.x][s.y].img !== matrix[i.x][i.y].img) {
                    let temp = matrix[s.x][s.y].img;
                    matrix[s.x][s.y].img = matrix[i.x][i.y].img;
                    matrix[i.x][i.y].img = temp;
                }

                //将 matrix 里面的图片重绘
                stage.drawStage();

                startInt = {
                    x: imgPlace.x,
                    y: imgPlace.y
                }

                //调用消去函数
                stage.continueToDissloved();
            } 
            stage.drawStage();

            pubdata.moveFlag = false;
        });


    });
}
