"use strict";
var yeoman = require('yeoman-generator'),
	path = require('path'),
	exec = require('child_process').exec,
	fs = require('fs'),
	del = require('del'),
	log = console.log;


var LegoGenerator = yeoman.generators.Base.extend({
	
	init: function (){
		// 当前模板的全局配置数据，配置svn信息和命令流
		this.gConfig = this.src.readJSON('.yo-rc.json')
	},

	prompting: function(){
		var done = this.async()
		var questions = [
			{
				name: 'projectFamily',
				type: 'list',
				message: '发布到svn静态资源服务器的根文件夹:',
				choices: [
					{
						name: 'special',
						value: 'special',
						checked: true
					},{
						name: 'project',
						value: 'project'
					},{
						name: 'game',
						value: 'game'
					}
				]
			},{
				name: 'projectName',
				message: '项目名称',
				default: path.basename(process.cwd())
			},{
				name: 'projectVersion',
				message: '版本号',
				default: '1.0.0'
			},{
				name: 'projectAuthor',
				message: '开发者',
				default: this.gConfig.projectAuthor||''
			}
		]
		if(!this.gConfig.svnUsr){
			questions.push({
				name: 'svnUsr',
				message: 'svn用户名',
				default: this.gConfig.svnUsr||''
			},{
				name: 'svnPwd',
				message: 'svn密码',
				default: this.gConfig.svnPwd||''
			})
		}
		this.prompt(questions, function(answers){
			for(var item in answers){
				answers.hasOwnProperty(item) && (this[item] = answers[item])
			}
			done()
		}.bind(this))
	},

	writing: function(){
		// 同步问答结果，更新当前模板的配置数据
		this.gConfig.projectAuthor = this.projectAuthor
		this.gConfig.svnUsr = this.svnUsr?this.svnUsr:this.gConfig.svnUsr
		this.gConfig.svnPwd = this.svnPwd?this.svnPwd:this.gConfig.svnPwd
		this.write(path.join(__dirname, 'templates', '.yo-rc.json'), JSON.stringify(this.gConfig, null, 4), {encoding: 'utf8'})
		
		// 拷贝资源文件，资源文件可以通过`<%= %>`读取当前实例的数据
		this.directory('src', 'src')
		this.directory('tools', 'tools')
		this.copy('gulpfile.js', 'gulpfile.js')
		this.copy('package.json', 'package.json')
	},

	end: function(){
		// 文件转移后 删除不需要的文件
		del(['src/**/.gitignore'])

		// 文件转移后 执行以下命令
		if(process.platform === "darwin"||"linux"){
        	this.spawnCommand('ln', ['-s', path.join(__dirname, 'templates', 'node_modules'), 'node_modules'])
        	// this.spawnCommand('bower', ['install'], {cwd: 'src'})
        	if(this.gConfig['open_app']){
        		this.spawnCommand('open', ['-a', this.gConfig['open_app'], '.'])
        	} 
        	this.spawnCommand('gulp')
		}
        this.installDependencies()
        // this.log('done!')
	}

});

module.exports = LegoGenerator;