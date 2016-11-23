$(window).on('scroll.elasticity', function (e){
    e.preventDefault();
}).on('touchmove.elasticity', function(e){
    e.preventDefault();
});

$(document).ready(() => {
    // let 
    const pub = {
        canvas: document.getElementById('canvas'),
        ctx: document.getElementById('canvas').getContext('2d'),
        //第一行图片的数量
        xNum: 7,
        //第一列图片的数量
        yNum: 7,
        imgWidth: parseInt((screen.width) / 7),
        imgHeight: parseInt((screen.width) / 7),
        halfWidth: 20,
        allImgs: document.querySelector('.allimg').children,
        gameOver () {
            alert('gameover');
        }
    }

    pub.canvas.width = screen.width;
    pub.canvas.height = screen.width;

    // document.getElementById('canvas-container ').style.width = screen.width;

    let pubdata = {
        moveFlag : false,
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
    //存放可以消去图片的信息
    let imgDissloved = [];

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
                // imgDissloved[i] = new Array();
                for (let j = 0; j <= pub.yNum-1; j++) {
                    let len = pub.allImgs.length;
                    let index = Math.round(Math.random()*(len-1) + 0);
                    let animal = new Animal(pub.ctx, i*pub.imgWidth, j*pub.imgHeight, pub.allImgs[index], false);

                    matrix[i][j] = animal;
                    animal.paint();
                    // imgDissloved[i][j] = 0;
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

        //对 存入matrix 的图片进行重绘
        drawStage () {
            for (let i = 0; i <= pub.xNum-1; i++) {
                for (let j = 0; j <= pub.yNum-1; j++) {
                    matrix[i][j].paint();
                }
            }
        }
        
        //随机重绘 某一张 图片
        drawNewImg (matrix, i, k) {
            let len = pub.allImgs.length;
            let index = Math.round(Math.random()*(len-1) + 0);
            matrix[i][k].img = pub.allImgs[index];

            return index;
        }

        //消除 Y方向 可以消去的小动物
        repaintY (z, i, j) {
            for (let k = 0; k <= z; k++) {
                matrix[i][j+k].refresh();
            }
            if (j <= 2) {
                //先将已有的元素下移
                for (let k = j; k >= 1; k--) {
                    let zCopy = z;
                    matrix[i][k+zCopy].img = matrix[i][k-1].img;
                    zCopy--;
                }
                //随机生成
                for (let k = 0; k <= z; k++) {
                    stage.drawNewImg(matrix, i, k);
                }
            } else {
                for (let k = j; k > 0; k--) {
                    let zCopy = z;
                    matrix[i][k+zCopy].img = matrix[i][k-1].img;
                    zCopy--;
                } 
                for (let k = 0; k <= z; k++) {
                    stage.drawNewImg(matrix, i, k);
                } 
                stage.drawStage();
            }
        }

        //消除 X方向 可以消去的小动物
        repaintX (z, i, j) {
            for (let k = 0; k <= z; k++) {
                matrix[i+k][j].refresh();
            }
            if (j == 0) {
                for (let m = i; m <= i + z; m++)
                    stage.drawNewImg(matrix, m, 0);
            } else {
                for (let m = i; m <= i + z; m++) {
                    for (let k = j; k >= 1; k--) {
                        matrix[m][k].img = matrix[m][k-1].img;
                        stage.drawNewImg(matrix, m, 0);
                    }
                }
            }
        }

        //如果 y方向 有可以消除的小动物, 返回 count
        findYSameImg(count, i, j) {
            if (matrix[i][j+count]) {
                // if (matrix[i][j-count]) {
                //     //Find a picture with a duplicate number of count
                //     for (var z = 0; z < count; z++) {
                //         if (matrix[i][j+z-1]) {
                //             if (matrix[i][j-z].img !== matrix[i][j-z-1].img) {
                //                 break;
                //             }
                //         } 
                //     }
                //     if (z === count) {
                //         return j-count;
                //     }
                // }
                for (var z = 0; z < count; z++) {
                    //如果下一张图片不为空
                    if (matrix[i][j+z+1]) {
                        if (matrix[i][j+z].img !== matrix[i][j+z+1].img) {
                            break;
                        }
                    } 
                }
                if (z === count) {
                    for (let k = 0; k <= count; k++) {
                        matrix[i][j+k].toRemove = true;
                    }
                    return z;
                }
            } 
        }

        //如果 x方向 可以消除的小动物, 返回 count
        findXSameImg(count, i, j) {
            if (i < pub.xNum - count) {
                for (var z = 0; z < count; z++) {
                    if (matrix[i+z+1][j]) {
                        if (matrix[i+z][j].img !== matrix[i+z+1][j].img) 
                            break;
                    } 
                }
                if (z === count) {
                    //同时消除两个方向的小动物
                    // if (count === 2) {  
                        //如果 x方向 有可以消去的小动物 检查四周
                        // for (let m = 0; m <= count; m++) {
                        //     console.log(m);
                        //     if (j >= 1) {
                        //         for (var k = count; k > 0; k--) {
                        //             console.log('test');
                        //             console.log(i, j, k);
                        //             console.log(i+m, j+k, j+k-1);
                        //             // if (matrix[i+m＋1][j+k].img !== matrix[i+m+1][j+k-1].img) 
                        //                 // break;
                        //         }
                        //         if (k === 0) {
                        //             // console.log('test');
                        //             // stage.repaintY(count, i+m＋1, j-count);
                        //         }
                        //     }
                        //     // if (matrix[i+m+1][j+count]) {
                        //     //     for (let k = 0; k < count; k++) {
                        //     //         if (matrix[i+m＋1][j+k].img !== matrix[i+m+1][j+k+1].img) 
                        //     //             break;
                        //     //     }
                        //     //     if (k === 0) {
                        //     //         stage.repaintY(count, i+m＋1, j);
                        //     //     }
                        //     // }
                        //     // if (matrix[i+m+1][j-1] &&　matrix[i+m+1][j+1]) {
                        //     //     for (let k = 0; k < count; k++) {
                        //     //         if (matrix[i+m＋1][j+k-1].img !== matrix[i+m+1][j+k].img) 
                        //     //             break;
                        //     //     }
                        //     //     if (k === 0) {
                        //     //         stage.repaintY(count, i+m＋1, j-1);
                        //     //     }
                        //     // } 
                        // }
                    // }
                    // for (let k = 0; k <= count; k++) {
                    //     matrix[i+k][j].toRemove = true;
                    // }
                    return z;
                }
            }
        }

        
        isDissloved () {
            let repeatImg = [];
            for (let i = 0; i < pub.xNum; i++) {
                repeatImg[i] = new Array(); 
                for (let j = 0; j < pub.yNum; j++) {
                    
                    if (stage.findYSameImg(4, i, j) === 4) {
                        console.log('y success5');
                        stage.repaintY(4, i, j);

                        setTimeout(function () {
                            stage.drawStage();
                        }, 500);
                    } else 
                    if (stage.findYSameImg(3, i, j) === 3) {
                        console.log('y success4');
                        stage.repaintY(3, i, j);

                        setTimeout(function () {
                            stage.drawStage();
                        }, 500);
                    } else if (stage.findYSameImg(2, i, j) === 2) {
                        console.log('y success3');
                        stage.repaintY(2, i, j);

                        setTimeout(function () {
                            stage.drawStage();
                        }, 500);
                    }

                    if (stage.findXSameImg(4, i, j) === 4) {
                        console.log('x success5');
                        stage.repaintX(4, i, j);

                        setTimeout(function () {
                            stage.drawStage();
                        }, 500);
                    } else if (stage.findXSameImg(3, i, j) === 3) {
                        console.log('x success4');
                        stage.repaintX(3, i, j);

                        setTimeout(function () {
                            stage.drawStage();
                        }, 500);
                    } else 
                    if (stage.findXSameImg(2, i, j) === 2) {
                        console.log('x success3');
                        stage.repaintX(2, i, j);

                        setTimeout(function () {
                            stage.drawStage();
                        }, 500);
                    }
                }
            }   
            return repeatImg;
        }
    }

    class Animal {
        constructor (ctx, x, y, img, toRemove) {
            this.ctx = ctx;
            this.x = x;
            this.y = y;
            this.img = img;
            this.toRemove = toRemove;
        }

        paint () {
            this.ctx.drawImage(this.img, this.x, this.y, pub.imgWidth, pub.imgHeight);
        }

        fall () {
            this.y += .5;
            stage.refresh();
            this.paint();
        }

        //满足消去条件后 图片的变化
        eliminated () {
            //不重绘即可
            //此处还应该有一些动画
        } 

        refresh () {
            this.ctx.clearRect(this.x, this.y, pub.imgWidth, pub.imgHeight);
        }

    }

    let stage = new Stage();


    stage.drawNewStage();
    setTimeout(function () {
        stage.isDissloved();
    }, 500);

    pub.canvas.addEventListener('touchstart', function(e) {
        var e = e || window.event;

        //保存点击图片时的位置
        start = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };

        startInt = {
            x: parseInt((start.x - this.offsetLeft) / pub.imgWidth) * pub.imgWidth,
            y: parseInt((start.y - this.offsetTop) / pub.imgWidth) * pub.imgWidth
        };
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
                        y: startInt.y + pub.imgWidth
                    }                    
                } else {
                    pubdata.imgPlaceStay();
                }
            } else {
                if (start.y - mouse.y >= pub.halfWidth) {
                    imgPlace = {
                        x: startInt.x,
                        y: startInt.y - pub.imgWidth
                    };
                } else {
                    pubdata.imgPlaceStay();
                }
            }
        }
    });

    pub.canvas.addEventListener('touchend', function (e) {
        if (pubdata.moveFlag) {
            //交换两个位置的图片
            let temp = matrix[startInt.x / pub.imgWidth][startInt.y / pub.imgWidth].img;
            matrix[startInt.x / pub.imgWidth][startInt.y / pub.imgWidth].img = matrix[imgPlace.x/pub.imgWidth][imgPlace.y/pub.imgWidth].img;
            matrix[imgPlace.x/pub.imgWidth][imgPlace.y/pub.imgWidth].img = temp;

            //将 matrix 里面的图片重绘
            stage.drawStage();

            startInt = {
                x: imgPlace.x,
                y: imgPlace.y
            }

            setTimeout(function () {
                stage.isDissloved();
            }, 500);
        } 
        pubdata.moveFlag = false;
    });
        // stage.isDissloved();
});