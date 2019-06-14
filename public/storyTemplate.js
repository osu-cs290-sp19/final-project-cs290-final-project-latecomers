(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['story'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"content-box story-box\">\r\n                    <p class=\"story-title\">"
    + alias4(((helper = (helper = helpers.storyTitle || (depth0 != null ? depth0.storyTitle : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"storyTitle","hash":{},"data":data}) : helper)))
    + "</p>\r\n                    <p class=\"story-contributers\">"
    + alias4(((helper = (helper = helpers.storyAuthor || (depth0 != null ? depth0.storyAuthor : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"storyAuthor","hash":{},"data":data}) : helper)))
    + " <i class=\"fas fa-pen-fancy\"></i></p>\r\n                    <p class=\"story-likes\">"
    + alias4(((helper = (helper = helpers.storyUpvotes || (depth0 != null ? depth0.storyUpvotes : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"storyUpvotes","hash":{},"data":data}) : helper)))
    + " <i class=\"fas fa-thumbs-up\"></i></p>\r\n                    <p class=\"story-snippet\">"
    + alias4(((helper = (helper = helpers.storyText || (depth0 != null ? depth0.storyText : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"storyText","hash":{},"data":data}) : helper)))
    + "</p>\r\n                </div>";
},"useData":true});
})();