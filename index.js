

/* ----------------------------------------------------------
setting
---------------------------------------------------------- */

var file = "data/data.tsv"
var year = 117;
var unit = 12;
var offset = 0;
var svg = d3.select("svg")
var distance = 30;
var distanceY = 26;

var places = [
	{id:"asahikawa",label:"旭川",offset:0},
	{id:"sapporo",label:"札幌",offset:0},
	{id:"ishimaki",label:"石巻",offset:0},
	{id:"kanazawa",label:"金沢",offset:0},
	{id:"tokyo",label:"東京",offset:0},
	{id:"nagoya",label:"名古屋",offset:0},
	{id:"osaka",label:"大阪",offset:0},
	{id:"hiroshima",label:"広島",offset:0},
	{id:"tokushima",label:"徳島",offset:0},
	{id:"fukuoka",label:"福岡",offset:0},
	{id:"naha",label:"那覇",offset:15},
	{id:"showa",label:"昭和基地(南極)",offset:0}
]

var grafY = 120
var colors = d3.scaleLinear()
	.domain([-30,-10,					0,			20,			25,			30,			35])
	.range(["#0800a9","blue","#4fb094","green","#eed930","red","a75600"])
	.interpolate(d3.interpolateHcl)

var stageG = svg.append("g").attr("transform","translate(120,"+grafY+")")
		// stageG.attr("style","filter:url(#gooeyCodeFilter);" )
var stageGT = svg.append("g").attr("transform","translate(120,"+grafY+")")

var graf1 =[]
var grafT =[]
var offsetYs = 0
for (var i = 0; i < places.length ; i++) {
	graf1.push(stageG.append("g").attr("transform","translate(1,"+offsetYs+")"))
	grafT.push( stageGT.append("g").attr("transform","translate(0,"+offsetYs+")") )
	stageGT.append("text").attr("transform","translate(-100,"+ (offsetYs + 20) +")").text(places[i].label)
		.attr("class",d => {
			return ["t_spot" , "t_spot-" + places[i].id ].join(" ")
		})
		offsetYs += distanceY + places[i].offset
}

svg.append("rect").attr("width","100%").attr("height",35).attr("class","title_bg")
svg.append("text").attr("x",20).attr("y",25).attr("class","t_title")
		.html("日本の平均気温の推移<tspan>（1900年〜2017年）</tspan>");
svg.append("text").attr("x",20).attr("y",485).attr("class","t_note")
	.text("※気象庁の統計データを利用しています。　データが存在しない部分は、色を黒くしてます。")
svg.append("text").attr("x",95).attr("y",130).attr("class","t_note")
	.text("(°C)")

var yearText = svg.append("text")
	.attr("transform","translate(20,105)").attr("class","t_year")
var gText = svg.append("g").attr("transform","translate(130,465)")
for (var i = 0; i < 12 ; i++) {
	gText.append("text").attr("x",distance*i).attr("class","t_month").text((i+1)+"月")
}

/* ----------------------------------------------------------
load
---------------------------------------------------------- */

var data;
d3.tsv(file).then(function(_data) {
	data = _data;
	start();
})

/* ----------------------------------------------------------
update
---------------------------------------------------------- */
function getColor(d){
	if(d == undefined)return "#000";
	return colors(d)
}
function getColorT(d){return "#fff"}

function update(_data,_data2,_off){
	for (var n = 0; n < places.length ; n++) {
		var cirs = graf1[n].selectAll("rect").data(_data[n])
		var texts = grafT[n].selectAll("text").data(_data[n]);
		if(_off == -1){
			cirs.enter().append("rect")
				.attr("fill","#000")
				.attr("y",function(d,i){return 0})
				.attr("x",function(d,i){return i*distance})
				.attr("width",distance)
				.attr("height",distanceY)
			texts.enter().append("text")
				.attr("y",5)
				.attr("style","font-size:11px;")
				.attr("fill","#fff")
				.attr("text-anchor","middle")
				.attr("y",distanceY/2 +5)
				.attr("x", (d,i) => i*distance  + (distance/2))
				.attr("style", "font-size:11px")
				.attr("class","t_cell")
				.text( "-")
		} else {
			if(_off == 0){}
			cirs.transition().duration(speed)
				.attr("fill",getColor)
				// .attr("r",getSize)
			texts
				.attr("fill",getColorT)
				.text( d => {
					if(d== undefined) return "―";
					return d;
				})
				yearText.text( _off + 1900 );
		}
	}
}


var speed = 500;
var state = "init";
function start(){
	var dd = []
	var dd2 = []
	for (var i = 0; i < places.length ; i++) {
		for (var n = 0; n < unit ; n++) {
			if(!dd[n])dd[n] = []
			if(!dd2[n])dd2[n] = []
			dd[i].push(0);
			dd2[i].push(0);
		}
	}
	update(dd,dd2,-1);
	var tID_pre
	new serial_([
		function () { }
		,0.3, function () {
			var yy = 0;
			tID_pre = setInterval(function(){
					yy += (1900 - yy) * 0.4;
					yearText.text( Math.round(yy) );
					if(Math.round(yy) >= 1900){
						clearInterval(tID_pre);
					}
			},30);
				next()
		}
		,1.5, function () {
			state = "running";
			speed = 100;
			var tID = setInterval(function(){
				if(offset <= year){
					next()
				} else{
					clearInterval(tID);
				}
				offset ++;
			},100);
		}
	]).start();
}

function next(){
	var dd = []
	var dd2 = []
	for (var i = 0; i < unit ; i++) {
		var nn = (offset * unit) + i;
		if(data[nn]){
			for (var n = 0; n < places.length ; n++) {
				if(!dd[n])dd[n] = []
				if(!dd2[n])dd2[n] = []
				dd[n].push(data[nn][places[n].id])
			}
		}
	}
	update(dd,dd2,offset);
	if(state == "running"){
	if(offset == 0) createTargetYear(offset);
	if(offset == 20) createTargetYear(offset);
	if(offset == 40) createTargetYear(offset);
	if(offset == 60) createTargetYear(offset);
	if(offset == 80) createTargetYear(offset);
	if(offset == 100) createTargetYear(offset);
	if(offset == 117) createTargetYear(offset);
	}
}

var thumnCount  = 0
var thmubStage = svg.append("g").attr("transform","translate(160,50)")
var thmubStage2 = svg.append("g").attr("transform","translate(160,50)")
function createTargetYear(_off){
	var _stage = thmubStage.append("g").attr("transform","translate("+45*thumnCount+",0)").attr("class","thumb_item");
	thumnCount++;
	var _text = thmubStage2.append("text").attr("transform","translate("+((45*thumnCount)-40)+",57)")
		.text( d => 1900 + _off)
		.attr("class","t_thumb_year")

	var dd = []
	for (var i = 0; i < unit ; i++) {
		var nn = (_off * unit) + i;
		if(data[nn]){
			for (var n = 0; n < places.length ; n++) {
				if(!dd[n])dd[n] = []
				dd[n].push(data[nn][places[n].id])
			}
		}
	}
	var _data = dd;
	var ww = 3;
	var off = 0
	for (var n = 0; n < places.length ; n++) {
		var gg = _stage.append("g").attr("transform","translate(0,"+off+")")
			off += ww + places[n].offset/4
			gg.selectAll("rect")
				.data(_data[n]).enter().append("rect")
				.attr("x",(d,i) => i*ww )
				.attr("width",ww)
				.attr("height",ww)
				.attr("fill",getColor)
				.transition().duration(1000).attr("style","opacity:1;")
	}
	setTimeout(function(){
		_stage.attr("class","thumb_item show")
		_text.attr("class","t_thumb_year show")
	},50);
}


var serial_=function(){var t=function(t){this.args=t,this.currentNo=0,this.playingFlg=!1,this.isPause=!1},i=t.prototype;return i.start=function(){this.playingFlg||(this.playingFlg=!0,this.execute_core())},i.execute_core=function(){if(this.playingFlg)if(this.currentNo<this.args.length){var t=this.args[this.currentNo];if("number"!=typeof t)t(),this.execute_next();else{var i=this;setTimeout(function(){i.execute_next()},1e3*t)}}else this.funish()},i.execute_next=function(){this.isPause||this.playingFlg&&(this.currentNo++,this.execute_core())},i.funish=function(){this.playingFlg=!1,this.init()},i.pause=function(){this.isPause=!0},i.restart=function(){this.isPause=!1,this.execute_next()},i.jump=function(t){this.currentNo=t-1},i.init=function(){this.playingFlg=!1,this.currentNo=0},i.remove=function(){this.currentNo=0,this.playingFlg=!1},t}();
