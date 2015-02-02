var request  = require('request');
var cheerio  = require('cheerio');
var notifier = require('node-notifier');

var refresh = 300000; // 5mins
var cap     = 12288; // mb data cap. 12gb.

console.log('Getting data');

var last = cap;

var cJar = request.jar();

var authDetail = require('./user.json');

function getData() {

	request(
		'https://myaccount.aber.ac.uk/protected/stunet/', 
		function(err, res, bo) {

			if (!err) {

				request(
					{
					    url: res.request.uri.href,
					    followRedirect : true,
					    followAllRedirects: true,
					    jar: cJar,
					    maxRedirects: 3,
					    port: 443,
					    encoding: "utf8",
					    auth: authDetail
					},
					function (error, response, body) {
						if (!error) {
							var $ = cheerio.load(body);

							var samlRes = $("[name='SAMLResponse']")['0'];
							var cookieRes = $("[name='TARGET']")['0'];

							if (samlRes)
								samlRes = samlRes.attribs.value;
							else
								return;

							if (cookieRes)
								cookieRes = cookieRes.attribs.value;
							else
								return;

							request(
								{
									url: 'https://myaccount.aber.ac.uk/Shibboleth.sso/SAML/POST',
								    followRedirect : true,
								    followAllRedirects: true,
								    jar: cJar,
								    maxRedirects: 3,
								    port: 443,
								    encoding: 'utf8',
								    method: 'POST',
								    strictSSL: false,
								    auth: authDetail,
								    headers: {
								    	"Content-Type": "application/x-www-form-urlencoded",
								    	"Origin": "https://shibboleth.aber.ac.uk",
								    	"Referer": "https://shibboleth.aber.ac.uk/idp/profile/Shibboleth/SSO"
								    },
								    form: {
								    	"SAMLResponse": samlRes,
								    	"TARGET": cookieRes,
								    }
								},
								function (error, response, body) {
									if (!error) {
										//console.log(body);

										request(
											{
												url: 'https://myaccount.aber.ac.uk/protected/stunet/',
											    followRedirect : true,
											    followAllRedirects: true,
											    jar: cJar,
											    maxRedirects: 3,
											    port: 443,
											    encoding: 'utf8',
											    method: 'GET',
											    strictSSL: false,
											    auth: authDetail
											},
											function(err, res, bo) {
												var $ = cheerio.load(bo);

												var info = $("#webapp:contains('Total')");

												var data = info.html();

												var regex = /Total\s24\shour\saccounted\straffic:\s(.*)MB\./g;

												var groups = regex.exec(data);


												if (groups && groups.length > 0) {

													var obj = {
														"data": groups[1]
													};

													/*var table = $('.propertable tr');

													table.each(
														function(index, value) {
															console.log('new');
															for (var i in value.children) {
																var blah = value.children[i].children;

																if (blah) {
																	console.log(blah[0].data);
																}
															}
														}
													);

													console.log(obj);*/	

													var remaining = cap - parseInt(obj.data);

													remaining = remaining / 1024;

													remaining = remaining.toFixed(2);

													console.log(obj.data);

													if (remaining < last) {

														last = remaining;

														notifier.notify({
														  'title': 'Aber Data Usage.',
														  'message': remaining + 'gb remaining.'
														});		
													}								
												}
											}
										);
									}
								}
							);

						}
					}
				);
			}
		}
	);

	setInterval(
		function() {
			getData();
		}, 
		refresh
	);
}


getData();


