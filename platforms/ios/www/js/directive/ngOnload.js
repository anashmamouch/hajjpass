"use strict";var elementOnloadDirective=function(){return{restrict:"A",scope:{callback:"&ngOnload"},link:function(e,n,t){var i=n.length>0&&n[0].contentWindow?n[0].contentWindow.location:void 0;n.on("load",function(){return e.callback({contentLocation:i})})}}};elementOnloadDirective.$inject=[],elementOnloadDirective.directiveName="ngOnload",angular.module("ngOnload",[]).directive(elementOnloadDirective.directiveName,elementOnloadDirective);