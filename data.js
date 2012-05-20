(function () {
    "use strict";
    var OData = window.OData;

    // Descriptions
    var itemDescription = "Item Description: Pellentesque porta mauris quis interdum vehicula urna sapien ultrices velit nec venenatis dui odio in augue cras posuere enim a cursus convallis neque turpis malesuada erat ut adipiscing neque tortor ac erat";
    var itemContent = "<p>Curabitur class aliquam vestibulum nam curae maecenas sed integer cras phasellus suspendisse quisque donec dis praesent accumsan bibendum pellentesque condimentum adipiscing etiam consequat vivamus dictumst aliquam duis convallis scelerisque est parturient ullamcorper aliquet fusce suspendisse nunc hac eleifend amet blandit facilisi condimentum commodo scelerisque faucibus aenean</p>";

    // These three strings encode placeholder images. 
    var lightGray = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY7h4+cp/AAhpA3h+ANDKAAAAAElFTkSuQmCC";
    var mediumGray = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY5g8dcZ/AAY/AsAlWFQ+AAAAAElFTkSuQmCC";
    var darkGray = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY3B0cPoPAANMAcOba1BlAAAAAElFTkSuQmCC";

    var northwindBase = "http://services.odata.org/Northwind/Northwind.svc/";
    var productImageBase = "http://demos.telerik.com/aspnet-ajax/Img/Northwind/Products/"
    var categoriesURL = northwindBase + "Categories";
    var categoriesList = [];

    var user, password;

    //generic function for loading data via a odata url
    function loadData(data, odataurl, dataloaded) {
        if (data) {
            return WinJS.Promise.as(data);
        }
        else {
            return new WinJS.Promise(function (complete, error, progress) {
                var request = {
                    headers: {
                        "X-Requested-With": "XMLHttpRequest",
                        "Accept": "application/atom+xml,application/atomsvc+xml,application/xml",
                        "Content-Type": "application/atom+xml",
                        "DataServiceVersion": "2.0"
                    },
                    recognizeDates: false,
                    requestUri: odataurl,
                    user: user,
                    password: password,
                    enableJsonpCallback: false,
                }

                OData.read(request,
                //swap above line with below if using Jsonp    
                //OData.read(odataurl,
                function (data) {
                    complete(dataloaded(data.results));
                },
                function (dataerror) {
                    error(dataerror);
                });
            });
        }
    }

    //Load Categories
    function loadCategories() {
        var i = 0;
        var t = 0;
        loadData(null, categoriesURL, function (results) {
            return results;
        }).then(function (data) {
            data.forEach(function (category) {

                //alternate background image
                if (t > 2) { t = 0 };
                var background;
                switch (parseInt(t)) {
                    case 0:
                        background = lightGray;
                        break;
                    case 1:
                        background = darkGray;
                        break;
                    case 2:
                        background = mediumGray;
                        break;
                }
                t++;
                categoriesList.push({
                    key: category.CategoryID,
                    title: category.CategoryName,
                    subtitle: category.Description,
                    backgroundImage: background,
                    description: category.Description
                });

                loadProducts(category.Products.__deferred.uri, i);
                i++;
            });
        });
    }

    // Load Products
    function loadProducts(productsURL, index) {
        loadData(null, productsURL, function (results) {
            return results;
        }).then(function (data) {
            data.forEach(function (product) {
                //format price to 2 decimals
                var num = parseFloat(product.UnitPrice);
                var n = num.toFixed(2);

                // push to list
                list.push({
                    group: categoriesList[index],
                    title: product.ProductName,
                    subtitle: product.ProductID,
                    description: itemDescription,
                    content: itemContent,
                    backgroundImage: productImageBase + parseInt(product.ProductID) + ".jpg",
                    price: "$" + n,
                    qty: product.QuantityPerUnit
                });
            });
        });
    }

    function groupKeySelector(item) {
        return item.group.key;
    }

    function groupDataSelector(item) {
        return item.group;
    }

    // This function returns a WinJS.Binding.List containing only the items
    // that belong to the provided group.
    function getItemsFromGroup(group) {
        return list.createFiltered(function (item) { return item.group.key === group.key; });
    }

    var list = new WinJS.Binding.List();
    var groupedItems = list.createGrouped(groupKeySelector, groupDataSelector);

    loadCategories();

    WinJS.Namespace.define("data", {
        items: groupedItems,
        groups: groupedItems.groups,
        getItemsFromGroup: getItemsFromGroup
    });
})();
