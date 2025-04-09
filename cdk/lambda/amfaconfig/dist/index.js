"use strict";var i=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var A=Object.getOwnPropertyNames;var N=Object.prototype.hasOwnProperty;var O=(o,e)=>{for(var n in e)i(o,n,{get:e[n],enumerable:!0})},y=(o,e,n,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of A(e))!N.call(o,s)&&s!==n&&i(o,s,{get:()=>e[s],enumerable:!(r=f(e,s))||r.enumerable});return o};var v=o=>y(i({},"__esModule",{value:!0}),o);var T={};O(T,{handler:()=>I});module.exports=v(T);var t=require("@aws-sdk/client-dynamodb"),c=require("@aws-sdk/client-cognito-identity-provider"),m=new t.DynamoDBClient({region:process.env.AWS_REGION}),S=new c.CognitoIdentityProviderClient({region:process.env.AWS_REGION}),g={"Access-Control-Allow-Headers":"Content-Type,Authorization,X-Api-Key,X-Requested-With","Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"OPTIONS,GET"},p=(o=200,e)=>(console.log("return with:",{statusCode:o,headers:g,body:e}),{statusCode:o,headers:g,body:e}),E=["amfaConfigs","amfaPolicies"],I=async o=>{console.info(`EVENT
`+JSON.stringify(o,null,2));let e=[];E.forEach(d=>{let u={TableName:process.env.AMFACONFIG_TABLE,Key:{configtype:{S:d}}};e.push(m.send(new t.GetItemCommand(u)))});let n={TableName:process.env.AMFATENANT_TABLE,Key:{id:{S:process.env.TENANT_ID}}};e.push(m.send(new t.GetItemCommand(n))),e.push(S.send(new c.DescribeUserPoolCommand({UserPoolId:process.env.USERPOOL_ID})));let[r,s,l,a]=await Promise.allSettled(e);return console.log("samlres",l),console.log("cognitores",a),r.status==="rejected"||s.status==="rejected"||l.status==="rejected"||a.status==="rejected"?(console.log("configres",r),console.log("policyres",s),console.log("samlres",l),console.log("cognitores",a),p(500,JSON.stringify({error:"Internal server error"}))):p(200,JSON.stringify({amfaConfigs:JSON.parse(r.value.Item.value.S),amfaPolicies:JSON.parse(s.value.Item.value.S),samlProxyEnabled:l.value.Item?.samlproxy?.BOOL,totalUserNumber:a.value.UserPool.EstimatedNumberOfUsers}))};0&&(module.exports={handler});
//# sourceMappingURL=index.js.map
