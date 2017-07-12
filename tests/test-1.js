var resourceErrors = []; //keep a list of broken resources, mostly 4xx and 5xx http statuses
var consoleMessages = []; //keep all console.log here


casper.on('started', function () { // add your headers here, for mobile browsers for example
    this.page.customHeaders = { 'Accept-Language': 'en-US' }
});
casper.options.verbose = true; 
casper.options.logLevel = 'debug';
casper.options.waitTimeout = 20000; //global max time to wait (when waiting for an element, page load or anything else that can actually time out)
// casper.options.colorizerType = "Dummy"; //disable colors


//referer to http://docs.casperjs.org/en/latest/events-filters.html
//track console messages
casper.on('remote.message', function(message) {
    consoleMessages.push(message);
    // this.echo(message);
});
//track http errors
casper.on('resource.error', function(resource) {
    var e = {
        url: resource.url,
        code: resource.errorCode, 
        message: resource.errorString
    }
    resourceErrors.push(e);
    // this.echo(e);
});

casper.on('http.status.404', function(resource) {
  this.echo('wait, this url is 404: ' + resource.url);
});

casper.on('http.status.503', function(resource) {
  this.echo('wait, this url is 503: ' + resource.url);
});


//describing a test, referer to http://docs.casperjs.org/en/latest/modules/tester.html
casper.test.begin('yahoo SERP test', 7, function suite(test) {
    casper.start("http://yahoo.com", function() { // goto a page and run a function when it finish loading
        this.capture(fs.workingDirectory.concat('/result/screen_').concat('load.png'));

        test.assertHttpStatus(200, "site is online");
        test.assertTitle("Yahoo", "page title is the one expected"); // pass only if title is exactly the same
        test.assertExists('input#uh-search-box', "search tex-box is found");
        test.assertExists('button#uh-search-button', "search button is found");
        this.sendKeys('input#uh-search-box', 'casperjs travis CI');  

        this.click("button#uh-search-button");
        this.wait(5000)
    }).viewport(1600,1000);//set browser size


    //wait untill DOM element is visible and then run the function
    casper.waitUntilVisible("body", function() {
        this.capture(fs.workingDirectory.concat('/result/screen_').concat('serp.png'));

        test.assertExists('div.compPagination', "we get some results reporting");
        test.assertEval(function() {
            return __utils__.findAll("div#results ol.searchCenterMiddle>li").length == 10;
        }, "we get exactly 10 results on first page");

        test.assertExists('div#results ol.searchCenterMiddle>li:nth-of-type(1) h3.title a', "we can click on first link from results");
        

        this.click("div#results ol.searchCenterMiddle>li:nth-of-type(1) h3.title a");
        this.wait(5000)
        
    });

    casper.waitForPopup(0, function(){
        
    });

    casper.withPopup(0, function(){
        this.capture(fs.workingDirectory.concat('/result/screen_').concat('target-site.png'));
        
    }); 

    //ignore this for now
    // casper.then(function(){
    //     test.assert(resourceErrors.length == 0, "no http errors");
    // })

    // run all steps
    casper.run(function() {//and when it's done, do something with the results
        /*if(resourceErrors.length){
            this.echo('-- HTTP ERRORS : ');
            this.echo(JSON.stringify(resourceErrors));
        }
        this.echo('-- CONSOLE MESSAGES : ');
        this.echo(JSON.stringify(consoleMessages));*/
        test.done();
    });
});