// Definition of Model object
var Model = function() {
	this.offices = [];
	this.staff = [];
	this.onPageLoad = null;
};
// Definition of a method to request list of offices from SPTG server
Model.prototype.getOffices = function() {
	//Make API call to server to get list of offices
	$.ajax({
		url: 'http://dev.smartpelican.com/public/test_task/departments.php',
		type: 'GET',
		dataType: 'json'
	}).done(function(result) {
		storeOfficesInModel(result);
	}).fail(function(jqXHR, err) {
		console.log(err);
	});
};
// Definition of a method to set offices to an array of office objects
Model.prototype.initializeOffices = function(offices) {
	this.offices = offices;
	if (this.onPageLoad) {
		this.onPageLoad(this.offices);
	}
};
// Definition of a View object
var View = function(oTSelector) {
	this.document = $(document);
	this.officeTemplate = $('#office_template li');
	this.officesList = $('#office_list');
	this.onPageLoad = null;
	this.document.ready(this.onLoad.bind(this));
};
// Definition of method to trigger get offices event after page has loaded
View.prototype.onLoad = function() {
	if(this.onPageLoad) {
		this.onPageLoad();
	}
};
// Definition of method to modify the view of the UI by rendering offices
View.prototype.renderOffices = function(offices) {
	for (var i = 0; i < offices.length; i++) {
		var office = offices[i];
		this.appendOffice(office.id, office.name);
	}
};
// Definition of method to modidify the view of the UI by appending an office
View.prototype.appendOffice = function(id, name) {
	console.log(id, name);
	var officeElement = this.officeTemplate.clone();
	var checkbox = officeElement.find('input');
	checkbox.attr('value', id);

	var officeName = officeElement.find('p');
	officeName.text(name);

	this.officesList.append(officeElement);
};
// Definition of Controller object
var Controller = function(model, view) {
	view.onPageLoad = model.getOffices.bind(model);
	model.onPageLoad = view.renderOffices.bind(view);
	storeOfficesInModel = model.initializeOffices.bind(model);
};

$(function() {
	// Create a Model instance
	var model = new Model();
	// Create a View instance
	var view = new View();
	// Create a Controller instance
	var controller = new Controller(model, view);
});