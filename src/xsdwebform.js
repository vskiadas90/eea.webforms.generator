/**
 * @file index.js
 * XSD Schema to HTML5 Web Form
 * @author George Bouris <gb@eworx.gr>
 * @copyright Copyright (C) 2017 EEA, Eworx, George Bouris. All rights reserved.
 */

'use strict';

// import heapdump from 'heapdump';  //debug library
import fs from 'fs';
import path from 'path';
import ncp from 'ncp';
import rimraf from 'rimraf';
import openurl from 'openurl';
import express from 'express';
import uglify from "uglify-js";
import uglifycss from "uglifycss";
import XSDWebFormParser from './lib/xsdwebform.parser.js'
import XSDWebFormParserError from './lib/xsdwebform.parser.error.js'

/**
 * Class XSDWebForm
 * XSD Schema to HTML5
 */
export default class XSDWebForm {

	/**
	 * Class constructor
	 * Check for arguments
	 */
	constructor(args) {
		return new Promise ( (resolve, reject) => {		

			//Version	
			this.Vesrion="0.1";

			//logging
			this.showLog = true;
			this.verbose = true;
			this.showXSDLog = true;

			//Build directory
			this.buildPath = "build/";
			// Input file variable
			var xsdFile = null;
			// HTML Input file variable
			var xmlHtmlFile = null;
			// Open the default browser when build is completed
			this.autoOpenOutput = false;

			// Check for [-f file] [-a | open browser after build] input
			args.forEach( 
				(item, index) => {
					if (item === '-f') {
						xsdFile = args[index + 1];
						return;
					}
					if (item === '-ul') {
						this.showLog = false;
						this.verbose = false;
						return;
					}
					if (item === '-l') {
						this.showXSDLog = false;
						return;
					}
					if (item === '-a') {
						this.autoOpenOutput = true;
						return;
					}
				});

			// XSDWebFormParser    		
			this.parser = new XSDWebFormParser(this.showLog, this.verbose, this.showXSDLog);
			
			// If not file input
			if (!xsdFile) {
				xsdFile = "./test/test.xsd";
			}

			// Lookup for base file name. Needed to check for (formname).form.xml file. Also, if file is named form.xsd then .js,.css filets etc are going to be named form.js form.css
			this.baseFileName = path.basename(xsdFile);
			this.baseFileName = this.baseFileName.substring(0, this.baseFileName.length - 3);
			this.basePath = path.dirname(xsdFile);
			xmlHtmlFile = this.baseFileName + "form.xml";

			// Create (/clean) Build directory and move files
			this.prepareJSFiles().then((res) => {
				try {
					// After Build directory preperation, parse the document
					this.parseFiles(xsdFile, xmlHtmlFile, this.basePath).then ( (response) => {	
						var app = express();
						var parent = this;
						var filePath = path.join( __dirname.substring(0, __dirname.length - 3), this.buildPath);

						// Start test web server in order to view the HTML5 file result.
						app.use(express.static(filePath))
							.listen(3001, function () {
								if (parent.showLog) {
									console.log("\x1b[1m\x1b[37mTest web server is listening on port 3001\x1b[0m");
									console.log(`http://localhost:3001/${parent.baseFileName}html\n\n`);
								}
								resolve(parent);
							});
						});
				} catch (err) {
					XSDWebFormParserError.reportError(err);
					reject(this);
				}
			});
		});
	};

	/**
	 * parseFiles - Parse XSD and XML files
	 * Open .xsd and .form.xml files and read the contents
	 * @param xsdFile
	 * @param xmlHtmlFile
	 */
	parseFiles(xsdFile, xmlHtmlFile, filePath) {
		return new Promise ( (resolve, reject) => {	
			var xObject = {
				xfile: xsdFile,
				xdata: '',
				hfile: xmlHtmlFile,
				hdata: ''
			};

			this.getFile(xsdFile).then((res) => {
				xObject.xdata = res;
				this.getFile(filePath + "/" + xmlHtmlFile).then((res) => {
					xObject.hdata = res;
					// Parse file content
					this.parser.parse(xObject);
					
					// Create HTML file
					this.createFile(this.buildPath + this.baseFileName + "html", this.getHeader() + this.parser.getHTMLOutput() + this.getFooter() ). then ( () => {
						this.getFile(__dirname + "/lng/ct-codelists-en.json").then((langs) => {
							langs = JSON.parse(langs);
							let langData = this.parser.getFullTextContent();
							langs.CTCodelists.Languages.item.forEach((item) => {
								this.createFile(this.buildPath + "lng/" + this.baseFileName + item.code + ".lang.json", langData, false);
								resolve();
							});
						});
					});

					// Create XSLT output
					this.createFile(this.buildPath + "xslt/" + this.baseFileName + "xslt", this.parser.getXSLTOutput());

					// Open browser 
					if (this.autoOpenOutput)
						openurl.open(`http://localhost:3001/${this.baseFileName}html`);
				});
			});
		});
	}

	/**
	 * prepareJSFiles - Copy JS folder to build
	 */
	prepareJSFiles() {
		var parent = this;
		return new Promise((resolve, reject) => {
			rimraf(parent.buildPath, fs, function() {
				if (!fs.existsSync(parent.buildPath)) {
					fs.mkdirSync(parent.buildPath);
					fs.mkdirSync(parent.buildPath+"xslt");
					ncp(__dirname + "/lng/", parent.buildPath + "lng", function(err) {
						if (err) {
							console.error(err);
							reject(err);
						}
					});
					ncp(__dirname + "/test/", parent.buildPath + "test", function(err) {
						if (err) {
							console.error(err);
							reject(err);
						}
					});
					ncp(__dirname + "/assets/", parent.buildPath + "assets", function(err) {
						if (err) {
							console.error(err);
							reject(err);
						}
						ncp(__dirname + "/webform.js", parent.buildPath + parent.baseFileName + "webform.js", function(err) {
							parent.getFile(__dirname + "/webform.js").then ( (data) => {
								parent.createFile(parent.buildPath + parent.baseFileName + "webform.min.js", uglify.minify(data).code, false);
							});
							if (err) {
								console.error(err);
								reject(err);
							}
							ncp(__dirname + "/webform.css", parent. buildPath + parent.baseFileName + "webform.css", function(err) {
								let uglified = uglifycss.processFiles(
								[ __dirname + "/webform.css" ],
									{ maxLineLen: 500, expandVars: true }
								);
								parent.createFile(parent.buildPath + parent.baseFileName +  "webform.min.css", uglified, false);
								if (err) {
									console.error(err);
									reject(err);
								}
							resolve();
							});
						});
					});
				}
			});
		});
	}


	/**
	 * setHeaer
	 * @param pageTitle
	 */

	getHeader() {

		return `
<!DOCTYPE html>
<html lang="en" ng-app="WebFormApp">
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=Edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>{{'pagetitle' | translate}}</title>

<script src="./assets/js/jquery.min.js"></script>
<script src="./assets/js/a/angular.all.min.js" ></script>
<script src="./${this.baseFileName}webform.min.js"></script>
<script src="./assets/components/eeaheader.min.js" ></script>
<script src="./assets/components/eealanguage.min.js" ></script>
<script src="./assets/components/eeatoolbar.min.js" ></script>
<script src="./assets/components/eeabuildinfo.min.js" ></script>

<link rel="stylesheet" type="text/css" href="./assets/css/webform.all.min.css"/>
<link rel="stylesheet" type="text/css" href="./${this.baseFileName}webform.min.css"/>

<link rel="shortcut icon" type="image/x-icon" href="./assets/img/favicon.ico"/>
<script>
var langFile = '${this.baseFileName}';
var groups = {${
	this.parser.htmlTagParser.HTMLObjects.map( (frm) => { 
		return '\n' + frm.itemObject.name + ': {'  + frm.itemObject.groups.map ((grp) => {
			return '\n\t\t\t' + grp.itemObject.name + ' : [1]';
		}) + ' \n\t\t}';
	})
} 
};
</script>
</head>
<body  ng-controller="WebFormAppCtrl">

<eea-header></eea-header>

<div id="container">
<div class="callout small primary">
	<div class="text-center">
		<h1>EEA</h1>
		<h2 class="subheader">Web Form</h2>
	</div>
	<eea-language scp="this" lang="{{selectedLanguage}}" chooselanguage="{{'chooselanguage' | translate}}"></eea-language>
</div>

<div id="workarea" class="row col-lg-8">
	
	<div class="row">
		<div class="top-form-left col-md-1"><span class="index">#</span></div>
		<div class="top-form-right col-md-11"><h2>{{'formtitle' | translate}}</h2></div>
	</div>
	
	<div class="row"> 
	`;
	}


	/**
	 * getFooter
	 */
	getFooter() {

		return `
	</div>
</div>

</div>

<eea-toolbar scp="this" off="{{'off' | translate}}" on="{{'on' | translate}}" save="{{'save' | translate}}" printpreview="{{'printpreview' | translate}}" close="{{'close' | translate}}" validation="{{'validation' | translate}}"></eea-toolbar>

<footer class="footer">
	<div class="footer-wrapper">
		<eea-form-build date="${new Date()}" user="${process.env.USER}"></eea-form-build>
	</div>
</footer>

</body>
</html>
`;
	}

	/**
	 * getFile
	 * @param file
	 */
	getFile(file) {
		return new Promise((resolve, reject) => {
			fs.readFile(file, 'utf8', (err, data) => {
				if (err) {
					XSDWebFormParserError.reportError(`No such file or directory ${err.path}\n`);
					reject(err);
				}
				resolve(data);
			});
		});
	}

	/**
	 * createFile - Save output file
	 * @param filename
	 * @param content
	 * @param log
	 */
	createFile(filename, content, log = true) {
		var parent = this;
		return new Promise((resolve, reject) => {
			fs.writeFile(filename, content, function(err) {
				if (err) {
					console.log(err);
					reject(err);
				} else {
					if (parent.showLog && log)
						console.log(`\x1b[2m\x1b[36mThe file ${filename} was saved\x1b[0m\n`);
					resolve();
				}
			});
		});
	}
}

var xsdWebForm = new XSDWebForm(process.argv);

module.exports.xsdWebForm = xsdWebForm;

// heapdump.writeSnapshot('./' + Date.now() + '.heapsnapshot');