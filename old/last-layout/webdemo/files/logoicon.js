var ctx=null;

M=function(cp1x, cp1y)					{ 	ctx.moveTo(cp1x, cp1y); 							}

C=function(cp1x, cp1y, cp2x, cp2y, x, y){ 	ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y); 	}

L=function(cp1x, cp1y)					{ 	ctx.lineTo(cp1x, cp1y); 							}

Q=function(cp1x, cp1y, cp2x, cp2y)		{ 	ctx.quadraticCurveTo(cp1x, cp1y, cp2x, cp2y); 		}

Z=function()							{	ctx.closePath();									}

s=function(stroke)						{	ctx.strokeStyle=stroke;								} 

f=function(fill)						{	ctx.fillStyle=fill;									} 

sw=function(w)							{	ctx.lineWidth=w;									} 

sz=function()							{	ctx.stroke();										} 

fz=function()							{	ctx.fill();											}

lg=function(x1,y1,x2,y2,sco,usp)				

{	

	grd = ctx.createLinearGradient(x1,y1,x2,y2);

	for(var i=0;i<sco.length;i++)

	{

		grd.addColorStop(sco[i][0],sco[i][1]);

			

	}

	ctx.fillStyle = grd;

}

rg=function(cx1,cy1,r1,fx1,fy1,r2,sco,usp)				

{

	grd = ctx.createRadialGradient(cx1,cy1,r1,fx1,fy1,r2);

	for(var i=0;i<sco.length;i++)

	{

		grd.addColorStop(sco[i][0],sco[i][1]);

		

	}

	ctx.fillStyle = grd;			

}



function getInternetExplorerVersion()

{

	var rv = -1; // Return value assumes failure.

	if (navigator.appName == 'Microsoft Internet Explorer')

	{

		var ua = navigator.userAgent;

		var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");

		if (re.exec(ua) != null)

		rv = parseFloat( RegExp.$1 );

	}

	return rv;

}

					

function drawCanvas()

{

	var canvas = document.getElementById('camdesklogo');

	if (canvas.getContext)

	{

		ctx = canvas.getContext('2d');

		ctx.beginPath();
M(9.9, 14.9);L(12.5, 14.4);C(13.1, 14.3, 13.4, 14.7, 13.9, 15.2);C(14.4, 15.8, 15, 16.5, 15.5, 17.2);C(15.8, 17.6, 16.2, 18.2, 15.9, 18.8);C(15.8, 19.2, 15.4, 19.4, 15.1, 19.5);C(14.3, 19.8, 13.4, 19.9, 12.6, 19.9);L(11.5, 20);C(10.8, 20, 10, 20, 9.2, 20);L(8.5, 20);L(7, 19.9);C(6.5, 19.9, 5.3, 19.7, 4.8, 19.5);C(4.7, 19.4, 4.5, 19.3, 4.4, 19.2);C(3.8, 18.7, 3.9, 18.2, 4.2, 17.6);C(4.6, 17, 5.7, 15.7, 6.1, 15.2);C(6.4, 14.9, 6.7, 14.6, 7.1, 14.4);C(8, 14.2, 9.4, 14.8, 9.9, 14.9);Z();f('rgba(0,0,0,1)');rg(10,19.9,0,10,19.9,113.12919,[['0','rgba(250,250,250,1)'],['1','rgba(130,130,130,1)']],'userSpaceOnUse');fz();
ctx.beginPath();
M(14.2, 15.9);C(14.2, 17.3, 12.3, 18.4, 10, 18.4);C(7.7, 18.4, 5.8, 17.3, 5.8, 15.9);C(5.8, 14.4, 7.7, 13.3, 10, 13.3);C(12.3, 13.3, 14.2, 14.4, 14.2, 15.9);f('rgba(130,130,130,0.46017701)');rg(10,15.9,0,10,15.9,45.714287,[['0','rgba(130,130,130,1)'],['1','rgba(130,130,130,0)']],'userSpaceOnUse');fz();
ctx.beginPath();
M(16.7, 8.5);C(16.7, 13.2, 13.7, 17.1, 10, 17.1);C(6.3, 17.1, 3.3, 13.2, 3.3, 8.5);C(3.3, 3.8, 6.3, 0, 10, 0);C(13.7, 0, 16.7, 3.8, 16.7, 8.5);f('rgba(0,0,0,1)');rg(-612.7,348.3,0,-612.7,348.3,45.714287,[['0','rgba(255,255,255,1)'],['1','rgba(179,179,179,1)']],'userSpaceOnUse');fz();
ctx.beginPath();
M(14.6, 9.2);C(14.6, 12.4, 12.5, 15, 10, 15);C(7.5, 15, 5.4, 12.4, 5.4, 9.2);C(5.4, 6, 7.5, 3.4, 10, 3.4);C(12.5, 3.4, 14.6, 6, 14.6, 9.2);f('rgba(0,0,0,1)');lg(341.92007,545.78705,279.01047,513.255,[[0,'rgba(128,128,128,1)'],[1,'rgba(255,255,255,1)']],'userSpaceOnUse');fz();
ctx.beginPath();
M(12.7, 9.2);C(12.7, 11.1, 11.5, 12.7, 10, 12.7);C(8.5, 12.7, 7.3, 11.1, 7.3, 9.2);C(7.3, 7.2, 8.5, 5.7, 10, 5.7);C(11.5, 5.7, 12.7, 7.2, 12.7, 9.2);f('rgba(0,0,0,1)');rg(10,9.2,0,10,9.2,45.714287,[['0','rgba(255,0,0,1)'],['1','rgba(85,0,0,1)']],'userSpaceOnUse');fz();


	} 

} 

window.onload = function () 

{

	ieVersion=getInternetExplorerVersion();

	if(ieVersion>0 && ieVersion<9)

	{

		document.getElementById('message').style.fontFamily="Trebuchet MS, Verdana, Arial"; 

		document.getElementById('message').style.fontSize="110%";

		document.getElementById('message').style.width="800px";

		document.getElementById('message').style.top="50px";

		document.getElementById('message').style.left="50px";

		document.getElementById('message').innerHTML="This page does not work natively with this browser."+

		"<BR>Please go to <a href='http://www.irunmywebsite.com/raphael/SVGTOHTML_LIVE.php'>this</a> web address to convert SVG files to an alternative format."



	}

	else

	{

		drawCanvas();

	}		

}