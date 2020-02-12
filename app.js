const express = require('express'),
      app = express(),
      bodyParser  = require('body-parser');

var request = require('request');
const Nightmare = require('nightmare');
var port  = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended:true}));


var resultdata=[];
var id = 0;

app.get("/map",async (req,res) => {
/*
 {  
    "origin": "19.221512,73.164459",
    "destination": "19.236280,73.130730",
    "provideRouteAlternatives": false,
    "avoidHighways": false,
    "avoidTolls": false,
    "avoidFerries": false,
    "travelMode": "WALKING"
}
*/

var originlat= req.query.srclat;
var originlon= req.query.srclon;
var deslat= req.query.deslat;
var deslon= req.query.deslon;
console.log(req.query);
await map(originlat,originlon,deslat,deslon,id);
  res.json({ "id": id });


})
app.get('/job/:id', async (req, res) => {
  let tp = req.params.id;
  if(resultdata.length>tp){
    res.send({"result":resultdata[tp]});

  }else{
    res.send({"result":"job in progress"});
  }

});


function map(originlat,originlon,deslat,deslon,id){

  var url = "https://directionsdebug.firebaseapp.com/?origin="+originlat+","+originlon+"&destination="+deslat+","+deslon+"&mode=walking";
  console.log(url);
  /*
  var propertiesObject = {  
      origin: "19.221512,73.164459",
      destination: "19.236280,73.130730",
      provideRouteAlternatives: false,
      avoidHighways: false,
      avoidTolls: false,
      avoidFerries: false,
      travelMode: "WALKING"
  };
  
  request(url, function(err, response, html) {
      if(!err)
      {
        var $ = cheerio.load(html);
        console.log($);
        console.log(html);
        console.log($('.adp-text').eq(0).text());
      }
      console.log("Get response: " + response.statusCode);
      res.send("hi");
  });
  
  */
  
  var result=[];
  var  nightmare = Nightmare({ show: false, loadTimeout: 20000, executionTimeout: 25000  });
  nightmare.goto(url)
       .wait(6000)
   .evaluate(()=>{
       return Array.from($('.adp-substep').get().map(a => a.innerText));
     })
  
  .then((array)=>{
      console.log(array);
      
      
      var le=array.length;
      for(var i=0;i<le;i+=4){
              var obj={};  
              obj.index=array[i+1].split(".")[0];
              var tp = array[i+2];
              var a = tp.split("\n");
              obj.direction = a[0];
              obj.near = a[1];
              obj.distance = array[i+3].split("\n")[0];
            result.push(obj);  
      }
      resultdata.push({"result":result});
      id=id+1;
      
  }).catch((e)=>{return(e)});
  
  
}



app.listen(port,function(req,res){
    console.log("server started");
})