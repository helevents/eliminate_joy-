var express = require('express');
var router = express.Router();
var connect = require('../config/mysql_connect.js');

router.get('/', function(req, res, next) {
    // res.render('passone', {});
    
    try {
        connect.query("select stuid,pScore from funfest order by pScore desc", function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var rank = 0;
                var pScore;
                data.forEach(function (ele, index) {
                    if (req.session.stuid == ele.stuid) {
                        rank = index;
                        pScore = ele.pScore;
                    }
                });
                res.render('passone', { score: pScore, rank: rank+1 });
            }
        });
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;
