// Definition of Model object
var Model = function() {
    this.offices = [];
    this.staff = {
        _counter: 0,
    };
    this.onCreateOffice = null;
    this.onCheckedUnique = null;
    this.onRenderStaff = null;
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
    for (var i = 0; i < this.offices.length; i++) {
        if (offices[i]) {
            this.addOfficeInStaff(offices[i].name);
        }
    }

    if (this.onCreateOffice) {
        this.onCreateOffice(this.offices);
    }
};
// Definition of method to add office array to staff object
Model.prototype.addOfficeInStaff = function(office) {
    var officeName = office.charAt(0).toLowerCase() + office.substr(1).replace(' ', '_');
    this.staff[officeName] = [];
};
// Definition of method to check if office is unique
Model.prototype.checkIfUnique = function(office) {
    var unique = true;
    var officeName = office.charAt(0).toLowerCase() + office.substr(1).replace(' ', '_');
    if (this.staff[officeName]) {
        unique = false;
    }

    if (this.onCheckedUnique) {
        this.onCheckedUnique(unique);
    }
};
// Definition of method to create an office object 
Model.prototype.createOffice = function(office) {
    this.offices.push({
        id: this.offices.length + 1,
        name: office
    });
    this.addOfficeInStaff(office);
    if (this.onCreateOffice) {
        this.onCreateOffice(this.offices);
    }
};
// Definition of a method to remove office/s
Model.prototype.removeOffice = function(ofcs) {
    for (var office in ofcs) {
        var index = ofcs[office];
        if (this.offices[index] && (this.offices[index].id - 1) == index) {
            this.offices[index] = null;

            var officeArray = this.staff[office];
            this.staff[office] = null;
            delete this.staff[office];

            for (var element in officeArray) {
                officeArray[element] = null;
            }
            officeArray = null;
        }
    }

    if (this.onCreateOffice) {
        this.onCreateOffice(this.offices);
    }

    if (this.onRenderStaff) {
        this.onRenderStaff(this.staff);
    }
};
// Definition of method to create staff
Model.prototype.createStaff = function(newStaff) {
    this.staff._counter += 1;
    var officeName = newStaff.office.charAt(0).toLowerCase() + newStaff.office.substr(1).replace(' ', '_');
    var length = this.staff[officeName].length;
    newStaff.id = officeName + '_' + this.staff._counter + '_' + length;
    this.staff[officeName].push(newStaff);

    if ((this.staff[officeName][length].id == newStaff.id) && this.onRenderStaff) {
        this.onRenderStaff(this.staff);
    }
};
// Definition of method to remove staff
Model.prototype.removeStaff = function(stf) {
    for (var i = 0; i < stf.length; i++) {
        var stfObj = stf[i];
        var office = stfObj.office;
        var index = stfObj.index;
        var id = stfObj.id;
        if (this.staff[office][index].id == id) {
            delete this.staff[office][index];
        }
    }

    if (this.onRenderStaff) {
        this.onRenderStaff(this.staff);
    }
};
// Definition of method to return a staff object
Model.prototype.getStaff = function(stf) {
    var office = stf.office;
    var index = stf.index;
    var id = stf.id;
    if (this.staff[office][index].id == id) {
        return this.staff[office][index];
    }
};
// Definition of method to return an office object
Model.prototype.getOffice = function(index) {
    return this.offices[index];
};
// Definition of a View object
var View = function(oTSelector) {
    this.document = $(document);
    this.officeTemplate = $('#office_template li');
    this.officesList = $('#office_list');
    this.officeSelect = $('#office_select');
    this.officeAddForm = $('#ofc_add_form');
    this.officeRemoveForm = $('#office_rmv_form');
    this.staffTemplate = $('#staff_template li');
    this.staffList = $('#staff_list');
    this.staffAddForm = $('#staff_add_form');
    this.staffRemoveForm = $('#staff_rmv_form');
    this.officeInput = $('#office_input');
    this.uniqueFeedback = $('#unique');
    this.popupBox = $('#modal_box');
    this.confirmBtn = $('#confirm_btn');
    this.cancelBtn = $('#cancel_btn');
    this.removeList = $('#remove_list');
    this.removeItems = $('#remove_items');
    this.onPageLoad = null;
    this.onRemoveOffice = null;
    this.onRemoveStaff = null;
    this.onOfficeInput = null;
    this.onCreateOffice = null;
    this.onCreateStaff = null;
    this.unique = false;
    this.removeCallback = null;
    this.removeData = null;
    this.removeForm = null;
    this.getStaff = null;
    this.getOffice = null;
    this.document.ready(this.onLoad.bind(this));
    this.officeInput.on('input', this.checkIfUnique.bind(this));
    this.officeAddForm.submit(this.createOffice.bind(this));
    this.officeRemoveForm.submit(this.removeOffice.bind(this));
    this.staffAddForm.submit(this.createStaff.bind(this));
    this.staffRemoveForm.submit(this.removeStaff.bind(this));
    this.confirmBtn.on('click', this.popupConfirm.bind(this));
    this.cancelBtn.on('click', this.popupCancel.bind(this));
};
// Definition of method to trigger get offices event after page has loaded
View.prototype.onLoad = function() {
    if (this.onPageLoad) {
        this.onPageLoad();
    }
};
// Definition of method to modify the view of the UI by rendering offices
View.prototype.renderOffices = function(offices) {
    this.officesList.empty();
    this.officeSelect.empty();
    this.officeSelect.append('<option value="" disabled selected hidden>Office</option>');
    for (var i = 0; i < offices.length; i++) {
        var office = offices[i];
        if (office) {
            this.appendOffice(office.name, i, this.officesList, true);
            this.appendOfficeOption(office.name);
        }
    }
};
// Definition of method to modidify the view of the UI by appending an office
View.prototype.appendOffice = function(name, index, selector, checkbox) {
    var officeElement = this.officeTemplate.clone();
    var id = name.charAt(0).toLowerCase() + name.substr(1).replace(' ', '_') + '_' + index;
    officeElement.attr('id', id);

    var chkbox = officeElement.find('input');
    chkbox.attr('value', id);

    if (!checkbox) {
        var checkbox_div = officeElement.find('.checkbox_div');
        checkbox_div.attr('class', ' hidden');
    }

    var officeName = officeElement.find('p');
    officeName.text(name);

    selector.append(officeElement);
};
// Definition of method to render office select options
View.prototype.appendOfficeOption = function(name) {
    var id = '"o_' + name.toLowerCase + '"';
    var value = '"' + name + '"';
    var optionElement = '<option id=' + id + ' value=' + value + '>' + name + '</option';
    this.officeSelect.append(optionElement);
};
// Definition of method to evaluate whether or not new office name is unique
View.prototype.checkIfUnique = function() {
    var name = this.officeInput.val();
    this.name = name.charAt(0).toUpperCase() + name.substr(1);
    this.officeInput.val(this.name);
    if (this.onOfficeInput) {
        this.onOfficeInput(this.name);
    }
};
// Definition of method to display if office input is unique or not
View.prototype.displayIfUnique = function(unique) {
    if (unique) {
        this.uniqueFeedback.text('Unique');
        this.uniqueFeedback.css('color', 'green');
        this.unique = true;
    } else {
        this.uniqueFeedback.text('Not Unique! Enter a unique office name!');
        this.uniqueFeedback.css('color', 'red');
        this.unique = false;
    }
};
// Definition of method to create an office
View.prototype.createOffice = function(event) {
    event.preventDefault();
    var form = event.currentTarget;
    if (this.unique) {
        var name = form[0].value;
        if (this.onCreateOffice) {
            this.onCreateOffice(name);
        }
        form[0].value = '';
        this.uniqueFeedback.text('');
    } else {
        form[0].value = '';
    }
};
// Definition of method for removing offices
View.prototype.removeOffice = function(event) {
    event.preventDefault();
    var form = event.currentTarget;
    var checkedCounter = 0;
    this.officesToDelete = {};
    this.removeList.empty();
    this.removeItems.text(' office(s) and it\'s staff member(s)');
    for (var i = 0; i < form.length - 1; i++) {
        if (form[i].checked) {
            checkedCounter += 1;
            var checkboxValue = form[i].value;
            var delimiter = checkboxValue.lastIndexOf('_');
            var officeName = checkboxValue.substring(0, delimiter);
            var officeIndex = checkboxValue.substring(delimiter + 1);
            this.officesToDelete[officeName] = officeIndex;

            var officeObj = this.getOffice(officeIndex);
            this.appendOffice(officeObj.name, i, this.removeList, false);
        }
    }

    if (this.onRemoveOffice && checkedCounter) {
        this.removeCallback = this.onRemoveOffice;
        this.removeData = this.officesToDelete;
        this.removeForm = form;
        this.popupBox.fadeIn(100);
    }
};

// Definition of method to create staff member
View.prototype.createStaff = function(event) {
    event.preventDefault();
    var form = event.currentTarget;
    var staff = {
        id: '',
        fname: '',
        lname: '',
        office: '',
        doh: {
            month: 0,
            day: 0,
            year: 0
        },
    };
    staff.fname = form[0].value;
    staff.lname = form[1].value;
    staff.office = form[2].value;
    staff.doh.month = form[3].value;
    staff.doh.day = form[4].value;
    staff.doh.year = form[5].value;
    if (this.onCreateStaff) {
        this.onCreateStaff(staff);
    }
    form.reset();
};
// Definition of method to render a staff element
View.prototype.renderStaff = function(staff) {
    this.staffList.empty();
    for (var office in staff) {
        if (staff[office]) {
            for (var i = 0; i < staff[office].length; i++) {
                if (staff[office][i]) {
                    var stf = staff[office][i];
                    this.appendStaff(stf, this.staffList, true);
                }
            }
        }
    }
};
// Definition of method to append staff to staff list
View.prototype.appendStaff = function(staff, selector, checkbox) {
    var staffElement = this.staffTemplate.clone();
    staffElement.attr('id', staff.id);

    var chkbox = staffElement.find('input');
    chkbox.attr('value', staff.id);

    if (!checkbox) {
        var checkbox_div = staffElement.find('.checkbox_div');
        checkbox_div.attr('class', ' hidden');
    }

    var fname = staffElement.find('.fname p');
    fname.text(staff.fname);

    var lname = staffElement.find('.lname p');
    lname.text(staff.lname);

    var office = staffElement.find('.staff_office p');
    office.text(staff.office);

    var hireDate = staff.doh.month + '/' + staff.doh.day + '/' + staff.doh.year;
    var doh = staffElement.find('.hire_date p');
    doh.text(hireDate);

    selector.append(staffElement);
};
//Definition of method to handle remove staff event
View.prototype.removeStaff = function(event) {
    event.preventDefault();
    var form = event.currentTarget;
    var checkedCounter = 0;
    this.staffToDelete = [];
    this.removeList.empty();
    this.removeItems.text(' staff member(s)');
    for (var i = 0; i < form.length - 1; i++) {
        if (form[i].checked) {
            checkedCounter += 1;
            var staffElementId = form[i].value;
            var delimiter1 = staffElementId.lastIndexOf('_');
            var delimiter2 = staffElementId.lastIndexOf('_', delimiter1 - 1);
            var staffOffice = staffElementId.substring(0, delimiter2);
            // var staffId = staffElementId.substring(delimiter2+1, delimiter1);
            var staffIndex = staffElementId.substring(delimiter1 + 1);
            var staff = {
                office: staffOffice,
                id: staffElementId,
                index: staffIndex
            };
            this.staffToDelete.push(staff);
            var staffObj = this.getStaff(staff);
            this.appendStaff(staffObj, this.removeList, false);
        }
    }

    if (this.onRemoveStaff && checkedCounter) {
        this.removeCallback = this.onRemoveStaff;
        this.removeData = this.staffToDelete;
        this.removeForm = form;
        this.popupBox.fadeIn(100);
    }
};
// Definition of method to handle popup confirmation
View.prototype.popupConfirm = function() {
    this.popupBox.fadeOut(100);
    this.removeCallback(this.removeData);
};
// Definition of method to handle popup cancellation
View.prototype.popupCancel = function() {
    this.removeForm.reset();
    this.popupBox.fadeOut(100);
};
// Definition of Controller object
var Controller = function(model, view) {
    view.onPageLoad = model.getOffices.bind(model);
    model.onCreateOffice = view.renderOffices.bind(view);
    storeOfficesInModel = model.initializeOffices.bind(model);
    view.onRemoveOffice = model.removeOffice.bind(model);
    view.onOfficeInput = model.checkIfUnique.bind(model);
    model.onCheckedUnique = view.displayIfUnique.bind(view);
    view.onCreateOffice = model.createOffice.bind(model);
    view.onCreateStaff = model.createStaff.bind(model);
    model.onRenderStaff = view.renderStaff.bind(view);
    view.onRemoveStaff = model.removeStaff.bind(model);
    view.getStaff = model.getStaff.bind(model);
    view.getOffice = model.getOffice.bind(model);
};

$(function() {
    // Create a Model instance
    var model = new Model();
    // Create a View instance
    var view = new View();
    // Create a Controller instance
    var controller = new Controller(model, view);
});
