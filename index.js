var request = require('request');
var cheerio = require('cheerio');

console.log('Getting data');

var cJar = request.jar();

var authDetail = require('./user.json');

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

						var samlRes = $("[name='SAMLResponse']")['0'].attribs.value;
						var cookieRes = $("[name='TARGET']")['0'].attribs.value;

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

											var regex = /Total\s24\shour\saccounted\straffic:\s(.*)\./g;

											var groups = regex.exec(data);


											if (groups && groups.length > 0) {

												var obj = {
													"data": groups[1]
												};

												var table = $('.propertable tr');

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

												console.log(obj);											
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
