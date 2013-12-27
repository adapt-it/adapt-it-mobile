define(function (require) {

    "use strict";

    var $               = require('jquery'),
        Handlebars      = require('handlebars'),
        Backbone        = require('backbone'),
        ChapterListView = require('app/views/ChapterListView'),
        models          = require('app/models/chapter'),
        tplText         = require('text!tpl/Home.html'),
        template = Handlebars.compile(tplText);


    return Backbone.View.extend({

      el: $("#login-form"),
     
      events: {
        "click #login": "login"
      },
     
      initialize: function(){
        var self = this;
     
        this.username = $("#username");
        this.password = $("#password");
     
        this.username.change(function(e){
          self.model.set({username: $(e.currentTarget).val()});
        });
     
        this.password.change(function(e){
          self.model.set({password: $(e.currentTarget).val()});
        });
      },
     
      login: function(){
        var user= this.model.get('username');
        var pword = this.model.get('password');
        alert("You logged in as " + user + " and a password of " + pword);
        return false;
      }
        
    });

});