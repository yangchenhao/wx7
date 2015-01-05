var g_seats=[];				//用于显示座位
var g_area, g_row, g_col;	//用于标记座位区域，行，列
var flag=document.getElementById("seatStatus").innerHTML;	//用于标记当前活动类型
function upCaseCharToInt(s)	//用于类型转换
{
	return(s.charCodeAt()-65); 
}
	
function intToUpcaseChar(n)	//用于类型转换
{
	return(String.fromCharCode(n+65));
}
	
function load(){			//加载时执行
	//控制座位图显示宽度
	document.getElementById("seatMap").style.width = document.getElementById("seatMapParent").style.width;

	var x=document.getElementById("idString");	//解析前存放所有座位
	var strs = x.innerHTML.split("s");			//存放解析后的所有座位
	var l = strs.length;						//座位数量
	
	var ticketstatus=document.getElementById("ticketstatus").innerHTML;		//标记当前门票状态
	if(flag=="0"){						//当前活动为不选区不选座的活动
		document.getElementById("successMsg0").style.display="block";
		document.getElementById("successMsg1").style.display="none";
		document.getElementById("successMsg2").style.display="none";
	}
	else if(flag=="1"){					//当前活动为选座的活动
		document.getElementById("successMsg1").style.display="block";
		document.getElementById("successMsg0").style.display="none";
		document.getElementById("successMsg2").style.display="none";
	}
	else{								//当前活动为选区的活动
		document.getElementById("successMsg2").style.display="block";
		document.getElementById("successMsg1").style.display="none";
		document.getElementById("successMsg0").style.display="none";
	}

	if(flag == "1" && ticketstatus == "1")//当前活动为选座的活动且门票有效
	{
		for(i in strs)
		{
			if(i != 0 && i != l-1)
			{
				var str = strs[i].split("_");
				var row = parseInt(str[1]);
				var col = parseInt(str[2]);//解析得到座位信息
				if(g_seats[upCaseCharToInt(str[0])] == undefined)
				{
					g_seats[upCaseCharToInt(str[0])]=[];
				}
				if(g_seats[upCaseCharToInt(str[0])][row] == undefined)
				{
					g_seats[upCaseCharToInt(str[0])][row]=[];
				}
				g_seats[upCaseCharToInt(str[0])][row][col]=1;	
				//用于标记该座位状态
			}
		}

		var area = document.getElementById("area");
		var row = document.getElementById("row");
		var col = document.getElementById("col");
		var para_area = document.createElement("option");
		var para_row = document.createElement("option");
		var para_col = document.createElement("option");
		para_area.value = -1;
		para_area.innerHTML = "随机";
		area.appendChild(para_area);
		para_row.value = -1;
		g_area = -1;
		var m_area = document.getElementById("m_area").innerHTML;
		var m_col = document.getElementById("m_col").innerHTML;
		var m_row = document.getElementById("m_row").innerHTML;
		//用于处理随机选项

		if(m_area != ''){//随机时显示图片，否则显示座位图
			document.getElementById("randomImage").style.display="none";
			document.getElementById("seatMap").style.display="block";
			clickSelect(String(upCaseCharToInt(m_area)));
		}
		else{
			document.getElementById("seatMap").style.display="none";
			document.getElementById("randomImage").style.display="block";
		}

		m_area = upCaseCharToInt(m_area)+1;	
		var token="s"+m_area+"_"+m_row+"_"+m_col;
		var x=document.getElementById(token);
		$(x).removeClass().addClass("as");			//在座位图上标识出用户选择的座位

		para_row.innerHTML = "随机";
		row.appendChild(para_row);
		g_row = -1;
		para_col.value = -1;
		para_col.innerHTML = "随机";
		col.appendChild(para_col);
		g_col = -1;
		for(i in g_seats)
		{
			var para_area = document.createElement("option");

			para_area.innerHTML = intToUpcaseChar(parseInt(i));
			para_area.value= intToUpcaseChar(parseInt(i));

			area.appendChild(para_area);
		}											//用户选择随机后的处理
	}
	else if(flag == "0"&& ticketstatus == "1")		//活动为不选区不选座活动且门票有效
	{
		var sf = document.getElementById("seatPic");
		sf.style.display="none";
		var vh = document.getElementById("successHolder");
		vh.style.display="block";
		var vh = document.getElementById("validationHolder");
		vh.style.display="none";
	}
	else if(flag == "2"&& ticketstatus == "1")		//活动为选区活动且门票有效
	{
		var as = document.getElementById("activityStatus").innerHTML;
		/*用于标记当前活动进行的阶段：
		0表示正在抢票
		1表示抽签结束
		2表示正在抽签*/
		var ss = document.getElementById("selectionStatus").innerHTML;
		/*用于标记当前活动是否已经选区：
		0表示尚未选区
		1表示已经选区*/
		var ts = document.getElementById("ticketStatus").innerHTML ;
		/*用于标记当前活动的抢票结果：
		0表示抢票失败
		1表示抢票成功*/
		if(as=="0" && ss=="0"){		//正在抢票且尚未选区
			//以下处理志愿选区显示结果
			var sf = document.getElementById("seatImage");
			var row = document.getElementById("row");
			var col = document.getElementById("col");
			var seatMap = document.getElementById("seatMap");
			seatMap.style.display="none";
			sf.style.display= "block";
			var area = document.getElementById("area");
			document.getElementById("sec1").innerHTML="您的一志愿为：";
			document.getElementById("sec2").innerHTML="您的二志愿为：";
			document.getElementById("sec3").innerHTML="您的三志愿为：";
			area.setAttribute("onchange","");
			row.setAttribute("onchange","");
			col.setAttribute("onchange","");
			for(i in strs)
			{
				if(i != 0 && i!= l-1)
				{
					var str = strs[i].split("_");
					if(str[1] != "0")
					{
						var para_area = document.createElement("option");

						para_area.innerHTML = intToUpcaseChar(parseInt(i)-1);
						para_area.value= intToUpcaseChar(parseInt(i)-1);
						
						var para_row = document.createElement("option");

						para_row.innerHTML = intToUpcaseChar(parseInt(i)-1);
						para_row.value= intToUpcaseChar(parseInt(i)-1);
						
						var para_col = document.createElement("option");

						para_col.innerHTML = intToUpcaseChar(parseInt(i)-1);
						para_col.value= intToUpcaseChar(parseInt(i)-1);

						area.appendChild(para_area);
						row.appendChild(para_row);
						col.appendChild(para_col);
					}
				}
			}
		}
		else if(as=="0" && ss=="1"){//正在抢票且已经选区
			var sf = document.getElementById("seatImage");
			var seatMap = document.getElementById("seatMap");
			var sh = document.getElementById("successHolder");
			var vh = document.getElementById("validationHolder");
			seatMap.style.display="none";
			sf.style.display= "block";
			sh.style.display="block";
			vh.style.display="none";
		}
		else if(as=="2"){//正在抽签
			var sf = document.getElementById("seatImage");
			var seatMap = document.getElementById("seatMap");
			var sh = document.getElementById("ticketWaiting");
			var vh = document.getElementById("validationHolder");
			seatMap.style.display="none";
			sf.style.display= "block";
			sh.style.display="block";
			vh.style.display="none";
		}
		else if(as=="1" && ts=="0"){//抽签结束，抢票失败
			var sf = document.getElementById("seatImage");
			var seatMap = document.getElementById("seatMap");
			var sh = document.getElementById("ticketResult_Fail");
			var vh = document.getElementById("validationHolder");
			seatMap.style.display="none";
			sf.style.display= "block";
			sh.style.display="block";
			vh.style.display="none";
		}
		else {//抽签结束，抢票成功
			var sf = document.getElementById("seatImage");
			var seatMap = document.getElementById("seatMap");
			var sh = document.getElementById("ticketResult_Succ");
			var vh = document.getElementById("validationHolder");
			seatMap.style.display="none";
			sf.style.display= "block";
			sh.style.display="block";
			vh.style.display="none";
		}
	}
	else{			//当前门票失效，如已退票或活动结束
		document.getElementById("ticketInvalid").style.display="block";
		document.getElementById("ticketResult_Fail").style.display="none";
		document.getElementById("ticketResult_Succ").style.display="none";
		document.getElementById("ticketWaiting").style.display="none";
		document.getElementById("successHolder").style.display="none";
		document.getElementById("validationHolder").style.display="none";
		document.getElementById("seatPic").style.display="none";
		document.getElementById("activityMenu").style.display="none";
	}
}

//处理选区的option控件动态显示
function areaClick(val){
	var row = document.getElementById("row");
	var col = document.getElementById("col");
	while(row.hasChildNodes()) 
    {
        row.removeChild(row.firstChild);
    }
	while(col.hasChildNodes()) 
    {
        col.removeChild(col.firstChild);
    }
	var para_row = document.createElement("option");
	para_row.value = -1;
	para_row.innerHTML = "随机";
	row.appendChild(para_row);
	g_row = -1;
	var para_col = document.createElement("option");
	para_col.value = -1;
	para_col.innerHTML = "随机";
	col.appendChild(para_col);
	g_col = -1;
	g_area = upCaseCharToInt(val);
	if(flag == "1")
	{
	    if(val == "-1"){
	    	$("li").remove();
        	$(".anum").remove();
        	document.getElementById("randomImage").style.display="block";
        	document.getElementById("seatMap").style.display="none";
	    }
		
		else{
			document.getElementById("randomImage").style.display="none";
			document.getElementById("seatMap").style.display="block";
			clickSelect(String(g_area));
		}
		
	}
	if(g_area != -1)
	{
		for(i in g_seats[g_area])
		{
			var para_row = document.createElement("option");
			para_row.value = i;
			para_row.innerHTML = i;
			row.appendChild(para_row);
		}
	}
}
//处理选行的option控件动态显示
function rowClick(val){
	g_row = val;
	var col = document.getElementById("col");
	while(col.hasChildNodes()) 
    {
        col.removeChild(col.firstChild);
    }	
	var para_col = document.createElement("option");
	para_col.value = -1;
	para_col.innerHTML = "随机";
	col.appendChild(para_col);
	g_col = -1;
	var x=document.getElementsByClassName("as");
	$(x).removeClass().addClass("af");
	if(val != -1)
	{
		for(i in g_seats[g_area][g_row])
		{
			var para_col = document.createElement("option");
			para_col.value = i;
		    para_col.innerHTML = i;
			col.appendChild(para_col);
		}
		var token="_"+val+"_";
		var x=$("li[id*="+token+"]");
		x.removeClass().addClass("as");
	}
}
//处理选列的option控件动态显示
function colClick(val){
	var x=document.getElementsByClassName("as");
	$(x).removeClass().addClass("af");
	var token="_"+g_row+"_"+val;
	var x=$("li[id$="+token+"]");
	x.removeClass().addClass("as");
	g_col = val;
	
}

document.onload = load();

//添加一个标签表示座位
function appendTxt(area, i, j, toppx, leftpx){
    var txt = '<li id="s'+area+'_'+i+'_'+j+'" title="'+i+'排'+j+'号" class="af" style="top:'+toppx+'px;left:'+leftpx+'px;"></li>'
    $("#seatMapData_ul").append(txt);
}

//画出座位图
function clickSelect(val){
	var x=document.getElementById("selectArea")
    if(val == "0"){//池座座位图
        $("li").remove();
        $(".anum").remove();
        for(var i=1; i<=19; i++){//操作每一排
			if(i==1){
				for(var j=1; j<=31; j++){
					var toppx = 5*(i-1)+30;
					if(j<=5) var leftpx = 30+5*(j+3);
					else if(j<=26) var leftpx = 30+5*(j+4);
					else var leftpx = 30+5*(j+6);
					appendTxt(1, i, j, toppx, leftpx);
				}
			}
			else if(i==18){
				for(var j=1; j<=32; j++){
					var toppx = 5*(i-1)+30;
					if(j<=5) var leftpx = 30+5*(j+3);
					else if(j<=27) var leftpx = 30+5*(j+4);
					else var leftpx = 30+5*(j+5);
					appendTxt(1, i, j, toppx, leftpx);
				}
			}
			else if(i==2){
				for(var j=1; j<=34; j++){
					var toppx = 5*(i-1)+30;
					if(j<=6) var leftpx = 30+5*(j+2);
					else if(j<=28) var leftpx = 30+5*(j+3);
					else var leftpx = 30+5*(j+4);
					appendTxt(1, i, j, toppx, leftpx);
				}
			}
			else if(i==17||i==3){
				for(var j=1; j<=35; j++){
					var toppx = 5*(i-1)+30;
					if(j<=7) var leftpx = 30+5*(j+1);
					else if(j<=28) var leftpx = 30+5*(j+2);
					else var leftpx = 30+5*(j+4);
					appendTxt(1, i, j, toppx, leftpx);
				}
			}
			else if(i==16||i==4){
				for(var j=1; j<=38; j++){
					var toppx = 5*(i-1)+30;
					if(j<=8) var leftpx = 30+5*(j);
					else if(j<=30) var leftpx = 30+5*(j+1);
					else var leftpx = 30+5*(j+2);
					appendTxt(1, i, j, toppx, leftpx);
				}
			}
			else if(i==5||i==7||i==9||i==11||i==13||i==15){
				for(var j=1; j<=39; j++){
					var toppx = 5*(i-1)+30;
					if(j<=9) var leftpx = 30+5*(j-1);
					else if(j<=30) var leftpx = 30+5*(j);
					else var leftpx = 30+5*(j+2);
					appendTxt(1, i, j, toppx, leftpx);
				}
			}
			else if(i==19){
				for(var j=1; j<=21; j++){
					var toppx = 5*(i-1)+30;
					var leftpx = 30+5*(j+9);
					appendTxt(1, i, j, toppx, leftpx);
				}
			}
			else{
				for(var j=1; j<=40; j++){
					var toppx = 5*(i-1)+30;
					if(j<=9) var leftpx = 30+5*(j-1);
					else if(j<=31) var leftpx = 30+5*(j);
					else var leftpx = 30+5*(j+1);
					appendTxt(1, i, j, toppx, leftpx);
				}
			}
		}
    }
    else if(val == "1"){//第一层座位图
        $("li").remove();
        $(".anum").remove();
       	for(var i=1; i<=22; i++){//操作每一排
			if(i==1){
				var txt1 = '<li id="s2_1_1" title="1排1号" class="af" style="top:10px;left:30px;"></li>'
				var txt2 = '<li id="s2_1_2" title="1排2号" class="af" style="top:10px;left:295px;"></li>'
				$("#seatMapData_ul").append(txt1,txt2);
			}
			else if(i==2){
				var txt1 = '<li id="s2_2_2" title="2排2号" class="af" style="top:15px;left:30px;"></li>'
				var txt2 = '<li id="s2_2_3" title="2排3号" class="af" style="top:15px;left:295px;"></li>'
				var txt3 = '<li id="s2_2_1" title="2排1号" class="af" style="top:15px;left:25px;"></li>'
				var txt4 = '<li id="s2_2_4" title="2排4号" class="af" style="top:15px;left:300px;"></li>'
				$("#seatMapData_ul").append(txt1,txt2,txt3,txt4);
			}
			else if(i==17||i==20){
				for(var j=1; j<=50; j++){
					var toppx = 5*(i)+10;
					if(j<=14) var leftpx = 10+5*(j+4);
					else if(j<=36) var leftpx = 10+5*(j+5);
					else var leftpx = 10+5*(j+6);
					appendTxt(2, i, j, toppx, leftpx);
				}
			}
			else if(i==18){
				for(var j=1; j<=56; j++){
					var toppx = 5*(i)+10;
					if(j<=17) var leftpx = 10+5*(j+1);
					else if(j<=39) var leftpx = 10+5*(j+2);
					else var leftpx = 10+5*(j+3);
					appendTxt(2, i, j, toppx, leftpx);
				}
			}
			else if(i==19){
				for(var j=1; j<=60; j++){
					var toppx = 5*(i)+10;
					if(j<=19) var leftpx = 10+5*(j-1);
					else if(j<=41) var leftpx = 10+5*(j);
					else var leftpx = 10+5*(j+1);
					appendTxt(2, i, j, toppx, leftpx);
				}
			}
			else if(i==21){
				for(var j=1; j<=42; j++){
					var toppx = 5*(i)+10;
					if(j<=10) var leftpx = 10+5*(j+8);
					else if(j<=32) var leftpx = 10+5*(j+9);
					else var leftpx = 10+5*(j+10);
					appendTxt(2, i, j, toppx, leftpx);
				}
			}
			else if(i==22){
				for(var j=1; j<=26; j++){
					var toppx = 5*(i)+10;
					if(j<=4) var leftpx = 10+5*(j+14);
					else if(j<=22) var leftpx = 10+5*(j+17);
					else var leftpx = 10+5*(j+20);
					appendTxt(2, i, j, toppx, leftpx);
				}
			}
			else{
				for(var j=1; j<=6; j++){
					var toppx = 5*(i-1)+10;
					if(j<=3) var leftpx = 10+5*(j+1);
					else var leftpx = 10+5*(j+53);
					appendTxt(2, i, j, toppx, leftpx);
				}
			}
		}
    }
    else if(val == "2"){//第二层座位图
        $("li").remove();
        $(".anum").remove();
        for(var i=1; i<=23; i++){操作每一排
        		
			if(i==1){
				var txt1 = '<li id="s3_1_1" title="1排1号" class="af" style="top:10px;left:20px;"></li>'
				var txt2 = '<li id="s3_1_2" title="1排2号" class="af" style="top:10px;left:325px;"></li>'
				$("#seatMapData_ul").append(txt1,txt2);
			}
			else if(i==2){
				var txt1 = '<li id="s3_2_2" title="2排2号" class="af" style="top:15px;left:20px;"></li>'
				var txt2 = '<li id="s3_2_3" title="2排3号" class="af" style="top:15px;left:325px;"></li>'
				var txt3 = '<li id="s3_2_1" title="2排1号" class="af" style="top:15px;left:10px;"></li>'
				var txt4 = '<li id="s3_2_4" title="2排4号" class="af" style="top:15px;left:335px;"></li>'
				$("#seatMapData_ul").append(txt1,txt2,txt3,txt4);
			}
			else if(i==16){
				for(var j=1; j<=58; j++){
					var toppx = 5*(i-1)+10;
					if(j<=3) var leftpx = 10+5*(j-1);
					else if(j<=19) var leftpx = 10+5*(j+2);
					else if(j<=39) var leftpx = 10+5*(j+3);
					else if(j<=55) var leftpx = 10+5*(j+4);
					else var leftpx = 10+5*(j+7);
					appendTxt(3, i, j, toppx, leftpx);
				}
			}
			else if(i==17){
				for(var j=1; j<=56; j++){
					var toppx = 5*(i-1)+10;
					if(j<=18) var leftpx = 10+5*(j+3);
					else if(j<=38) var leftpx = 10+5*(j+4);
					else var leftpx = 10+5*(j+5);
					appendTxt(3, i, j, toppx, leftpx);
				}
			}
			else if(i==18){
				for(var j=1; j<=58; j++){
					var toppx = 5*(i-1)+10;
					if(j<=19) var leftpx = 10+5*(j+2);
					else if(j<=39) var leftpx = 10+5*(j+3);
					else var leftpx = 10+5*(j+4);
					appendTxt(3, i, j, toppx, leftpx);
				}
			}
			else if(i==19){
				for(var j=1; j<=54; j++){
					var toppx = 5*(i-1)+10;
					if(j<=17) var leftpx = 10+5*(j+4);
					else if(j<=37) var leftpx = 10+5*(j+5);
					else var leftpx = 10+5*(j+6);
					appendTxt(3, i, j, toppx, leftpx);
				}
			}
			else if(i==20){
				for(var j=1; j<=44; j++){
					var toppx = 5*(i-1)+10;
					if(j<=12) var leftpx = 10+5*(j+9);
					else if(j<=32) var leftpx = 10+5*(j+10);
					else var leftpx = 10+5*(j+11);
					appendTxt(3, i, j, toppx, leftpx);
				}
			}
			else if(i==21){
				for(var j=1; j<=36; j++){
					var toppx = 5*(i-1)+10;
					if(j<=8) var leftpx = 10+5*(j+13);
					else if(j<=28) var leftpx = 10+5*(j+14);
					else var leftpx = 10+5*(j+15);
					appendTxt(3, i, j, toppx, leftpx);
				}
			}
			else if(i==22){
				for(var j=1; j<=28; j++){
					var toppx = 5*(i-1)+10;
					if(j<=4) var leftpx = 10+5*(j+17);
					else if(j<=24) var leftpx = 10+5*(j+18);
					else var leftpx = 10+5*(j+19);
					appendTxt(3, i, j, toppx, leftpx);
				}
			}
			else if(i==23){
				for(var j=1; j<=12; j++){
					var toppx = 5*(i-1)+10;
					var leftpx = 10+5*(j+26);
					appendTxt(3, i, j, toppx, leftpx);
				}
			}
			else{
				for(var j=1; j<=6; j++){
					var toppx = 5*(i-1)+10;
					if(j<=3) var leftpx = 10+5*(j-1);
					else var leftpx = 10+5*(j+59);
					appendTxt(3, i, j, toppx, leftpx);
				}
			}
		}
    }
    else{//第三层座位图
        $("li").remove();
        $(".anum").remove();
        for(var i=1; i<=22; i++){//操作每一排
			if(i>=1 && i<=3){
				var toppx = 5*(i-1)+10;
				var leftpx1 = 10+5*2;
				var leftpx2 = 10+5*57;
				var txt1 = '<li id="s4_'+i+'_1" title="'+i+'排1号" class="af" style="top:'+toppx+'px;left:'+leftpx1+'px;"></li>	'
				var txt2 = '<li id="s4_'+i+'_2" title="'+i+'排2号" class="af" style="top:'+toppx+'px;left:'+leftpx2+'px;"></li>	'
				$("#seatMapData_ul").append(txt1,txt2);
			}
			else if(i>=4 && i<=6){
				var toppx = 5*(i-1)+10;
				var leftpx1 = 10+5*2;
				var leftpx2 = 10+5*57;
				var leftpx3 = 10;
				var leftpx4 = 10+5*59;
				var txt1 = '<li id="s4_'+i+'_2" title="'+i+'排2号" class="af" style="top:'+toppx+'px;left:'+leftpx1+'px;"></li>	'
				var txt2 = '<li id="s4_'+i+'_3" title="'+i+'排3号" class="af" style="top:'+toppx+'px;left:'+leftpx2+'px;"></li>'
				var txt3 = '<li id="s4_'+i+'_1" title="'+i+'排1号" class="af" style="top:'+toppx+'px;left:'+leftpx3+'px;"></li>'
				var txt4 = '<li id="s4_'+i+'_4" title="'+i+'排4号" class="af" style="top:'+toppx+'px;left:'+leftpx4+'px;"></li>'
				$("#seatMapData_ul").append(txt1,txt2,txt3,txt4);
			}
			else if(i==16){
				for(var j=1; j<=52; j++){
					var toppx = 5*(i-1)+10;
					if(j<=3) var leftpx = 10+5*(j-1);
					else if(j<=16) var leftpx = 10+5*(j+2);
					else if(j<=36) var leftpx = 10+5*(j+3);
					else if(j<=49) var leftpx = 10+5*(j+4);
					else var leftpx = 10+5*(j+7);
					appendTxt(4, i, j, toppx, leftpx);
				}
			}
			else if(i==17){
				for(var j=1; j<=50; j++){
					var toppx = 5*(i-1)+10;
					if(j<=15) var leftpx = 10+5*(j+3);
					else if(j<=35) var leftpx = 10+5*(j+4);
					else var leftpx = 10+5*(j+5);
					appendTxt(4, i, j, toppx, leftpx);
				}
			}
			else if(i==18||i==19){
				for(var j=1; j	<=54; j++){
					var toppx = 5*(i-1)+10;
					if(j<=17) var leftpx = 10+5*(j+1);
					else if(j<=37) var leftpx = 10+5*(j+2);
					else var leftpx = 10+5*(j+3);
					appendTxt(4, i, j, toppx, leftpx);
				}
			}
			else if(i==20){
				for(var j=1; j	<=42; j++){
					var toppx = 5*(i-1)+10;
					if(j<=11) var leftpx = 10+5*(j+7);
					else if(j<=31) var leftpx = 10+5*(j+8);
					else var leftpx = 10+5*(j+9);
					appendTxt(4, i, j, toppx, leftpx);
				}
			}
			else if(i==21){
				for(var j=1; j	<=36; j++){
					var toppx = 5*(i-1)+10;
					if(j<=8) var leftpx = 10+5*(j+10);
					else if(j<=28) var leftpx = 10+5*(j+11);
					else var leftpx = 10+5*(j+12);
					appendTxt(4, i, j, toppx, leftpx);
				}
			}
			else if(i==22){
				for(var j=1; j	<=28; j++){
					var toppx = 5*(i-1)+10;
					if(j<=4) var leftpx = 10+5*(j+14);
					else if(j<=24) var leftpx = 10+5*(j+15);
					else var leftpx = 10+5*(j+16);
					appendTxt(4, i, j, toppx, leftpx);
				}
			}
			else{
				for(var j=1; j	<=6; j++){
					var toppx = 5*(i-1)+10;
					if(j<=3) var leftpx = 10+5*(j-1);
					else var leftpx = 10+5*(j+53);
					appendTxt(4, i, j, toppx, leftpx);
				}
			}
		}
    }
        
}