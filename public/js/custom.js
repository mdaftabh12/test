    //js/custom.js
    const wineForm = document.getElementById('wineForm');

    // DISPLAY WINE FROM SERVER INTO DATATABLES
    $(document).ready(async function () {
        const wineTable = $('#wineTable').DataTable({
            ajax: {
                url: '/wines',
                dataSrc: '',
            },
            columns: [
                { data: 'name' },
                { data: 'region', className: 'hide-on-mobile' },
                { data: 'price', className: 'hide-on-mobile' },
                { data: 'year', className: 'hide-on-mobile' },
                { data: 'varietal', className: 'hide-on-mobile' },
                { data: 'type', className: 'hide-on-mobile' },
                { data: 'winery', className: 'hide-on-mobile' },
                { data: 'country', className: 'hide-on-mobile' },
                { data: 'size', className: 'hide-on-mobile' },
                {
                    data: null,
                    render: function (data, type, row) {
                        return `<input type="checkbox" class="wine-checkbox" data-id="${row._id}">`;
                    },
                    className: 'hide-on-mobile'
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return `<button class="btn btn-danger btn-circle btn-delete"><i class="fa fa-trash"></i></button>
                                <button class="btn btn-info btn-circle btn-edit"><i class="fa fa-pencil"></i></button>`;
                    },
                }
            ],
            searching: true,
            ordering: true,
            paging: false,
            scrollCollapse: true,
            scrollY: '275px',
            
    });

    // FETCH WINES ON SEARCH
    const fetchWines = async (query) => {
      try {
        const response = await $.ajax({
          url: '/wines/search',
          method: 'GET',
          data: { name: query },
        });

        console.log('Received wines:', response);
        renderWines(response);

      } catch (error) {
        console.error('Error fetching wines:', error);
      }
    };

    const renderWines = (wines) => {
    const wineList = $('#wineList');
    wineList.empty();

        if (!wines || wines.length === 0) {
            wineList.append('<div>No wines found</div>');
            return;
        }

        wines.forEach(wine => {
            const wineElement = $('<div>')
                .addClass('wine-item')
                .html(`<strong>${wine.name}</strong> from ${wine.region}`);
            wineList.append(wineElement);
        });

        $('.wine-item').on('click', function () {
            const wineIndex = $(this).index(); 
            displayWineDetails(wines[wineIndex]);
        });
    };

    // MODAL DISPLAY AFTER CHOOSING WINE IN SEARCH
    const displayWineDetails = (wine) => {
        $('#wineName').text(wine.name);
        $('#wineRegion').text(wine.region);
        $('#wineType').text(wine.type);
        $('#wineWinery').text(wine.winery);
        $('#wineCountry').text(wine.country);

        // Populate editable fields
        $('#wineYear').val(wine.year);
        $('#winePrice').val(wine.price);
        $('#wineVarietal').val(wine.varietal);
        $('#wineSize').val(wine.size);

        if (!$('#wineQuantity').length) {
            const quantityInput = $('<label for="wineQuantity">Quantity</label><input type="number" id="wineQuantity" class="form-control" placeholder="">');
            $('#wineDetailsModal .modal-body').append(quantityInput);
        }

        $('#wineDetailsModal').modal('show');

        var wineType = wine.type.trim().toLowerCase();
        var heroImage = $('.hero-image img');

        if (wineType === 'white') {
            heroImage.attr('src', '/img/hero/white.png');
        } else if (wineType === 'red') {
            heroImage.attr('src', '/img/hero/red.png');
        } else if (wineType === 'rose') { 
            heroImage.attr('src', '/img/hero/rose.png');
        } else {
            heroImage.attr('src', '/img/hero/default.png');
        }

        $('#addToCatalogBtn').off('click').on('click', async function () {
            try {
                const wineName = $('#wineName').text();
                const wineRegion = $('#wineRegion').text();
                const winePrice = $('#winePrice').val();
                const wineYear = $('#wineYear').val();
                const wineVarietal = $('#wineVarietal').val();
                const wineType = $('#wineType').text();
                const wineWinery = $('#wineWinery').text();
                const wineCountry = $('#wineCountry').text();
                const wineSize = $('#wineSize').val();
                const wineQuantity = $('#wineQuantity').val();

                if (wineQuantity < 0) {
                    alert('Quantity cannot be negative.');
                    return;
                }

                if (!winePrice || !wineYear || !wineVarietal || !wineSize || !wineQuantity) {
                    alert('Please fill in all editable fields, including quantity.');
                    return;
                }

                const response = await $.ajax({
                    url: '/wines/addToCatalogByName',
                    method: 'POST',
                    data: {
                        name: wineName,
                        region: wineRegion,
                        price: winePrice,
                        year: wineYear,
                        varietal: wineVarietal,
                        type: wineType,
                        winery: wineWinery,
                        country: wineCountry,
                        size: wineSize,
                        quantity: wineQuantity, // Include quantity in the data sent to the server
                    },
                });

                console.log('Received wine details:', response);

                const searchQuery = $('#searchInput').val().trim();
                if (searchQuery.length > 0) {
                    fetchWines(searchQuery);
                }

                wineTable.ajax.reload();

                $('#wineDetailsModal').modal('hide');
            } catch (error) {
                console.error('Error fetching wine details:', error);
            }
        });
    };

    // Update the search bar input event to trigger the wine search
    $('#searchInput').on('input', function(event) {
      const searchQuery = $(this).val().trim();
      const wineList = $('#wineList');

      if (searchQuery.length > 0) {
        console.log('Search query submitted:', searchQuery);
        fetchWines(searchQuery);
      } else {
        wineList.empty();
      }
    });

    $('#searchInput').on('typeahead:select', function(ev, wine) {
      displayWineDetails(wine);
    });

    // Prevent form submission when Enter key is pressed
    $('#searchInput').on('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        return false;
      }
    });

    // FETCH WINE & SP500 DATA TO DASHBOARD CHART
    $(document).ready(async function () {
        try {
            const wineStockDataResponse = await fetch('/stock/dashboard');
            const sp500DataResponse = await fetch('/sp500/dashboard');

            if (!wineStockDataResponse.ok || !sp500DataResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            const wineStockData = await wineStockDataResponse.json();
            const sp500Data = await sp500DataResponse.json();

            const chartData = {
                categories: wineStockData.map(item => item.date),
                wineStock: wineStockData.map(item => item.value),
                sp500: sp500Data.map(item => item.value),
            };

            var options = {
                chart: {
                    type: 'area',
                    toolbar: {
                        show: false
                    }
                },
                series: [{
                    name: 'Wine Stock Index',
                    data: chartData.wineStock,
                    color: '#293846' // Blue color
                }, {
                    name: 'Global Equity Index',
                    data: chartData.sp500,
                    color: '#944444' // Green color
                }],
                dataLabels: {
                    enabled: false
                },

                yaxis: {
                    labels: {
                        formatter: function (value) {
                            return value.toFixed(2) + '%';
                        },
                    },
                },
                xaxis: {
                    type: 'datetime',
                    labels: {
                        show: true,
                    },
                    categories: chartData.categories,
                },
            };

            var chart = new ApexCharts(document.querySelector("#wineStockChart"), options);
            chart.render();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    });


    // FETCH & LOG ACTIVITY STREAM
    fetch('/dashboard/activity-logs')
    .then(response => response.json())
    .then(logs => {
        console.log('Logs received:', logs);

        const logsList = document.getElementById('logs-list');
        logsList.innerHTML = '';

        const logsByDate = {};

        logs.forEach(log => {
            const date = new Date(log.timestamp).toDateString();
            if (!logsByDate[date]) {
                logsByDate[date] = [];
            }

            logsByDate[date].push(log);
        });

        Object.keys(logsByDate).forEach(date => {
            const dateHeading = document.createElement('h4');
            dateHeading.textContent = date;
            logsList.appendChild(dateHeading);

            logsByDate[date].forEach(log => {
                const logItem = document.createElement('li');

                function formatTimestamp(timestamp) {
                    const date = new Date(timestamp);
                    return date.toLocaleString();
                }

                let logMessage = '';

                if (log.action === 'added') {
                    logMessage += `<i class="fa fa-check-circle"></i>`;
                } else if (log.action === 'deleted') {
                    logMessage += `<i class="fa fa-trash"></i>`;
                } else {
                    logMessage += `<i class="fa fa-pencil"></i>`;
                }

                logMessage += ` ${log.wineName} has been ${log.action} within your collection<br>`;
                logMessage += `On ${formatTimestamp(log.timestamp)}`;

                logItem.innerHTML = logMessage;
                logItem.classList.add('list-group-item');

                logsList.appendChild(logItem);
            });
        });

        logsList.style.overflowY = 'scroll';
        logsList.style.maxHeight = '220px'; // Set your preferred maximum height
    })
    .catch(error => {
        console.error('Error fetching logs:', error);
    });


    // DELETE ONE WINE BUTTON
    $('#wineTable tbody').on('click', '.btn-delete', async function (e) {
        e.preventDefault(); // Prevent default behavior
        e.stopPropagation(); // Stop event propagation

        const row = wineTable.row($(this).parents('tr'));
        const data = row.data();

        if (confirm('Are you sure you want to delete this wine?')) {
            try {
                const response = await axios.delete(`/wines/${data._id}`);
                console.log(response.data);

                if (response.status === 200) {
                    row.remove().draw(); // Remove the row from the DataTable
                } else {

                }
            } catch (error) {
                console.error(error);
            }
        }
    });

    $('#wineTable tbody').on('click', 'tr', function(e) {
        if (e.target.className !== 'btn btn-danger btn-delete') {
            e.stopPropagation(); // Prevent row deletion
        }
    });

        wineTable.ajax.reload();

        $('#wineTable').on('click', 'tbody tr', async function () {
          const row = wineTable.row(this);
          const data = row.data();

          if (confirm('Are you sure you want to delete this wine?')) {
            try {
              const response = await axios.delete(`/wines/${data._id}`);
              console.log(response.data);

              if (response.status === 200) {
                row.remove().draw(); 
              } else {
              }
            } catch (error) {
              console.error(error);
            }
        }
    });

    // DELETE MULTIPLE SELECTED BUTTON
    $('#bulkDeleteBtn').on('click', async function () {
        const selectedWines = [];

            // Loop through each checkbox to find selected wines
            $('.wine-checkbox:checked').each(function () {
                const wineId = $(this).data('id');
                selectedWines.push(wineId);
            });

            if (selectedWines.length > 0) {
                if (confirm(`Are you sure you want to delete ${selectedWines.length} selected wines?`)) {
                    try {
                        // Make a DELETE request to delete the selected wines
                        const promises = selectedWines.map(async (wineId) => {
                            try {
                                const response = await axios.delete(`/wines/${wineId}`);
                                return response.status === 200;
                            } catch (error) {
                                console.error(error);
                                return false;
                            }
                        });

                        // Wait for all delete requests to complete
                        const results = await Promise.all(promises);

                        if (results.every(result => result === true)) {
                            // Refresh the DataTable after successful deletion
                            $('#wineTable').DataTable().ajax.reload();
                        } else {
                            alert('Some deletions were unsuccessful. Please try again.');
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }
            } else {
                alert('Please select wines to delete.');
            }
        });

        // EDIT WINE MODAL FROM DATATABLES
        $('#wineTable tbody').on('click', '.btn-edit', function (e) {
            e.stopPropagation(); // Prevent row click event from firing

            const data = wineTable.row($(this).parents('tr')).data();

            // Prefill the modal form with the selected wine's data for editing
            $('#editName').val(data.name);
            $('#editRegion').val(data.region);
            $('#editPrice').val(data.price);
            $('#editYear').val(data.year);
            $('#editVarietal').val(data.varietal);
            $('#editType').val(data.type); // Include the 'type' field
            $('#editWinery').val(data.winery); // Include the 'winery' field
            $('#editCountry').val(data.country); // Include the 'country' field
            $('#editSize').val(data.size); // Include the 'size' field

            // Show the edit wine modal
            $('#editWineModal').modal('show');

            // Event listener for the submit button within the edit modal
            $('#editWineModal').on('submit', '#editWineForm', async function (event) {
                event.preventDefault(); // Prevent the default form submission

                // Extract the ID of the wine being edited (assuming 'data' contains the wine ID)
                const wineId = data._id;

                // Gather all the edited data from the form fields
                const formData = {
                    name: $('#editName').val(),
                    region: $('#editRegion').val(),
                    price: $('#editPrice').val(),
                    year: $('#editYear').val(),
                    varietal: $('#editVarietal').val(),
                    type: $('#editType').val(), // Include the 'type' field
                    winery: $('#editWinery').val(), // Include the 'winery' field
                    country: $('#editCountry').val(), // Include the 'country' field
                    size: $('#editSize').val(), // Include the 'size' field
                };

                try {
                    // Send a PUT request to update the wine using axios
                    const response = await axios.put(`/wines/${wineId}`, formData);
                    console.log('Wine updated successfully:', response.data);

                    // Optionally, perform actions after successful update, like hiding the modal and refreshing the table
                    $('#editWineModal').modal('hide');
                    $('#wineTable').DataTable().ajax.reload(); // Refresh the table to reflect changes
                } catch (error) {
                    console.error('Error updating wine:', error);
                    // Handle the error appropriately, such as displaying an error message to the user
                }
            });
        });

        // FETCH USERNAME
        async function fetchUserData() {
            try {
                const response = await fetch('/api/user'); // Your endpoint to fetch user data
                if (response.ok) {
                    const userData = await response.json();
                    return userData;
                } else {
                    throw new Error('Failed to fetch user data');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                return null;
            }
        }

        async function updateFirstnamePlaceholder() {
            try {
                const userData = await fetchUserData();

                if (userData && userData.firstName) {
                    const firstName = userData.firstName;
                    document.getElementById('firstnamePlaceholder').textContent = `Hello, ${firstName}`;
                    document.getElementById('firstnamePlaceholder').style.fontSize = '18px';
                } else if (userData && !userData.firstName) {
                    console.error('First name not found in user data:', userData);
                    document.getElementById('firstnamePlaceholder').textContent = 'No first name available';
                } else {
                    console.error('Invalid user data:', userData);
                    document.getElementById('firstnamePlaceholder').textContent = 'Error fetching data';
                }
            } catch (error) {
                console.error('Error updating first name placeholder:', error);
                document.getElementById('firstnamePlaceholder').textContent = 'Error fetching data';
            }
        }

        updateFirstnamePlaceholder();

        // UPDATE PROFILE DETAILS FOR LOGGED IN USER
        async function loadProfileImage(imageSrc, imageElementId) {
            try {
                const response = await fetch(imageSrc);
                if (!response.ok) {
                    throw new Error('Failed to fetch the image');
                }
                const blob = await response.blob();
                const objectURL = URL.createObjectURL(blob);
                const imageElement = document.getElementById(imageElementId);
                if (imageElement) {
                    imageElement.src = objectURL;
                }
            } catch (error) {
                console.error('Error loading profile image:', error);
            }
        }

        // Function to update profile details for logged-in user
        async function updateProfile(event) {
            event.preventDefault(); // Prevent default form submission behavior

            const form = document.getElementById('profileForm');
            const formData = new FormData(form);
            const fileInput = document.getElementById('profileImage').files[0]; // Get the uploaded file

            formData.append('profileImage', fileInput);

            try {
                const response = await fetch('/auth/updateProfile', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    // Profile updated successfully, fetch and display updated user data
                    await fetchAndPopulateUserData();
                    console.log('Profile updated successfully');
                    window.location.href = '/editprofile'; // Redirect to the profile edit page
                } else {
                    // Handle error response
                    const errorData = await response.json();
                    console.error('Profile update failed:', errorData.error);
                    // Show an error message to the user using errorData.error
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                // Show an error message to the user
            }
        }

        // Function to fetch user data from the server upon page load or login and populate profile fields
        async function fetchAndPopulateUserData() {
            try {
                const userDataResponse = await fetch('/api/user');
                const userData = await userDataResponse.json();

                if (userData) {
                    const firstNameElement = document.getElementById('firstName');
                    if (firstNameElement) {
                        firstNameElement.value = userData.firstName || '';
                    }

                    const lastNameElement = document.getElementById('lastName');
                    if (lastNameElement) {
                        lastNameElement.value = userData.lastName || '';
                    }

                    const emailElement = document.getElementById('email');
                    if (emailElement) {
                        emailElement.value = userData.email || '';
                    }

                    const profileImageElementId = 'profileImageElement';
                    const profileImagePath = userData.profileImage || 'default-profile-image.png';

                    const profileImageElement = document.getElementById(profileImageElementId);
                    if (profileImageElement) {
                        profileImageElement.onerror = function() {
                            // Set a default image in case the profile image fails to load
                            profileImageElement.src = userData.profileImage || '/uploads/default-profile-image.png';
                        };
                        loadProfileImage(profileImagePath, profileImageElementId); 
                    }
                } else {
                    console.error('User data not available');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }

        window.addEventListener('load', fetchAndPopulateUserData);

        document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('profileForm');
            form.addEventListener('submit', updateProfile); // Handle form submission
        });

        // GET TOTAL PRICE OF WINE
        async function getTotalWineValue() {
          try {
            const response = await fetch('/wines/totalWineValue'); // Fetch total wine value from backend
            const data = await response.json();
            document.getElementById('totalValue').innerText = `$${data.totalValue.toFixed(2)}`;
          } catch (error) {
            console.error('Error fetching data:', error);
            document.getElementById('totalValue').innerText = 'Error fetching data';
          }
        }

        await getTotalWineValue();

        // FETCH PRICES AND ITIMIZE BY PRICE CATEGORIES
        fetch('/wines/price-distribution')
        .then(response => response.json())
        .then(data => {
            const labels = Object.keys(data).map(priceRange => {
                const range = priceRange.split('-');
                if (range.length === 1) {
                    return `$${range[0]}+`;
                } else {
                    return `$${range[0]}-$${range[1]}`;
                }
            });

            const values = Object.values(data);

            const options = {
                chart: {
                    type: 'bar',
                },
                series: [{
                    data: values
                }],
                xaxis: {
                    categories: labels,
                    },
                yaxis: {
                    tickAmount: 5, // Adjust as needed
                    labels: {
                        formatter: function(val) {
                            return parseInt(val).toFixed(0);
                        }
                    }
                },
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: '85%',
                        colors: {
                            ranges: [{
                                from: 0,
                                to: 1,
                                color: '#944444'
                            }, {
                                from: 2,
                                to: 5,
                                color: '#944444'
                            }, {
                                from: 6,
                                to: 10,
                                color: '#944444'
                            }]
                        }
                    }
                },
                dataLabels: {
                    enabled: false
                },
                legend: {
                    show: false
                },
                grid: {
                    show: false,
                    borderColor: '#eee',
                    strokeDashArray: 4,
                    padding: {
                        bottom: 10
                    }
                }
            };

            var chart = new ApexCharts(document.querySelector("#barChart"), options);
            chart.render();
        })
        .catch(error => console.error('Error fetching data:', error));


        // FETCH WINE VARIETIES 
        fetch('/wines/variety-distribution')
        .then(response => response.json())
        .then(data => {
            const options = {
                chart: {
                    type: 'donut', // Using a donut chart for variety distribution
                    height: 350, // Set the height of the chart as needed
                },
                series: Object.values(data),
                labels: Object.keys(data),
                legend: {
                    show: true,
                    position: 'bottom',
                },
                plotOptions: {
                    pie: {
                        donut: {
                            labels: {
                                show: true,
                                total: {
                                    show: true,
                                    label: 'Total', // Label for the total value in the center
                                }
                            }
                        }
                    }
                },
                colors: ['#944444', '#A45358', '#B07777'], // Your preferred colors
                responsive: [{
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 200
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }]
            };

            var chart = new ApexCharts(document.querySelector("#wineVarietyChart"), options);
            chart.render();
        })
        .catch(error => console.error('Error fetching wine variety data:', error));

        // FETCH PRICE PER BOTTLE (PRICE / BOTTLES)
        async function getPricePerBottle() {
            try {
                const response = await axios.get('/wines/price-per-bottle');
                const pricePerBottle = response.data.pricePerBottle;

                console.log('Price per bottle (raw):', pricePerBottle);
                
                // Check if the retrieved value can be converted to a number
                const parsedPrice = parseFloat(pricePerBottle);
                if (!isNaN(parsedPrice)) {
                    const formattedPrice = parsedPrice.toFixed(2);
                    console.log('Price per bottle (formatted):', formattedPrice);

                    const pricePerBottleElement = document.getElementById('pricePerBottle');
                    if (pricePerBottleElement) {
                        pricePerBottleElement.textContent = `$${formattedPrice}`;
                    } else {
                        console.error('Element with ID "pricePerBottle" not found.');
                    }
                } else {
                    console.error('Value cannot be converted to a number.');
                    const pricePerBottleElement = document.getElementById('pricePerBottle');
                    if (pricePerBottleElement) {
                        pricePerBottleElement.textContent = 'N/A';
                    } else {
                        console.error('Element with ID "pricePerBottle" not found.');
                    }
                }
            } catch (error) {
                console.error('Error fetching price per bottle:', error);
                const pricePerBottleElement = document.getElementById('pricePerBottle');
                if (pricePerBottleElement) {
                    pricePerBottleElement.textContent = 'N/A';
                } else {
                    console.error('Element with ID "pricePerBottle" not found.');
                }
            }
        }

        await getPricePerBottle();

        // Edit wine
        $('#wineTable tbody').on('click', '.btn-edit', function () {
          const data = wineTable.row($(this).parents('tr')).data();
          // Implement logic to handle editing the wine data
          // Prefill the form with the selected wine's data for editing
        });
    });

    // Update JavaScript section
    $(document).ready(function() {
        $('#wineForm').submit(function(event) {
            event.preventDefault(); // Prevent the default form submission

                const formData = {
                    name: $('#name').val(),
                    region: $('#region').val(),
                    price: $('#price').val(),
                    year: $('#year').val(),
                    varietal: $('#varietal').val(),
                    type: $('#type').val(), // Include the 'type' field
                    winery: $('#winery').val(), // Include the 'winery' field
                    country: $('#country').val(), // Include the 'country' field
                    size: $('#size').val(), // Include the 'size' field
                };

                axios.post('/api/wines', formData)
                    .then(function(response) {
                        console.log('Wine added successfully:', response.data);
                        $('#addWineModal').modal('hide');
                        // Optionally, refresh the wine list or perform other actions
                    })
                    .catch(function(error) {
                        console.error('Error adding wine:', error);
                        // Optionally, display an error message to the user
                    });
        });
    });

      async function fetchTotalWines() {
          try {
              const response = await axios.get('/wines/totalCount');
              const totalWines = response.data.totalWineCount;
              document.getElementById('totalWines').textContent = totalWines; // Display with label 'Bottles: '
          } catch (error) {
              console.error('Error fetching total count of wines:', error);
          }
      }

      window.onload = fetchTotalWines;


    // ADD NEW WINES TO THE DATABASE
    wineForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Extract values from form fields
        const name = document.getElementById('name').value;
        const region = document.getElementById('region').value;
        const price = document.getElementById('price').value;
        const year = document.getElementById('year').value;
        const varietal = document.getElementById('varietal').value;
        const type = document.getElementById('type').value; // Include the 'type' field
        const winery = document.getElementById('winery').value; // Include the 'winery' field
        const country = document.getElementById('country').value; // Include the 'country' field
        const size = document.getElementById('size').value; // Include the 'size' field

        try {
            // Send POST request to add a new wine
            const response = await axios.post('/wines', { name, region, price, year, varietal, type, winery, country, size });
            console.log(response.data);

            // Refresh the DataTable after adding a new wine
            $('#wineTable').DataTable().ajax.reload();
        } catch (error) {
            console.error(error);
        }
    });

    // CSV IMPORT
    const handleCSVUpload = async (event) => {
      event.preventDefault();

      try {
        const csvUploadForm = document.getElementById('csvUploadForm').dropzone;
        csvUploadForm.processQueue();

        csvUploadForm.on('success', function (file, response) {
          console.log('CSV upload successful:', response);

          const wineTable = $('#wineTable').DataTable();

          wineTable.ajax.reload(null, false);

          window.location.href = '/collection';
        });

        csvUploadForm.on('error', function (file, errorMessage) {
          console.error('Error uploading CSV:', errorMessage);
        });
      } catch (error) {
        console.error('Error uploading CSV:', error);
      }
    };

    // LOGIN
    $(document).ready(function () {
        $('#loginForm').submit(function (event) {
            event.preventDefault(); // Prevent default form submission

            // Get form data
            var formData = {
                email: $('input[name=email]').val(),
                password: $('input[name=password]').val()
            };

            // AJAX POST request to the backend
            $.ajax({
                type: 'POST',
                url: '/auth/custom-login', // Change this URL to your backend login route
                data: formData,
                success: function (response, status, xhr) {
                    // Check the status code of the response
                    if (xhr.status === 200) {
                        // Redirect to dashboard only on successful login
                        console.log('Login successful');
                        window.location.replace('/dashboard'); // Redirect to the dashboard or homepage
                    } else {
                        // Handle other status codes
                        console.error('Login failed with status code:', xhr.status);
                        // Handle invalid credentials or other errors
                        alert('Invalid credentials. Please try again.');
                    }
                },
                error: function (xhr, status, error) {
                    // Handle error, e.g., display an error message
                    console.error('Login failed:', error);
                    alert('Login failed. Please try again.');
                }
            });
        });
    });

    function updateStockTicker() {
            const lastUpdate = localStorage.getItem('lastUpdate');
            const now = new Date().getTime();
            const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in a day

            const cachedData = JSON.parse(localStorage.getItem('stockData'));

            // Check if a day has passed since the last update or if no data is cached
            if (!cachedData || !lastUpdate || (now - lastUpdate > oneDay)) {
              axios.get('/tickers')
                .then(response => {
                  const stockData = response.data;

                  if (stockData.STZ && stockData.LVMUY && stockData.PDRDF && stockData.DEO) {
                    localStorage.setItem('stockData', JSON.stringify(stockData));
                    localStorage.setItem('lastUpdate', now);
                    console.log('Data stored in cache:', stockData);
                    displayStockData(stockData);
                  } else {
                    console.error('Incomplete stock data received:', stockData);
                  }
                })
                .catch(error => {
                  console.error('Error fetching stock data:', error);
                });
            } else {
              console.log('Retrieved cached data:', cachedData);
              displayStockData(cachedData);
            }
          }

          function displayStockData(stockData) {
            updateStockItem('stockDataSTZ', stockData.STZ);
            updateStockItem('stockDataLVMUY', stockData.LVMUY);
            updateStockItem('stockDataPDRDF', stockData.PDRDF);
            updateStockItem('stockDataDEO', stockData.DEO);
          }

          function updateStockItem(itemId, data) {
            const dailyChange = parseFloat(data.close) - parseFloat(data.open);
            const changePercent = ((dailyChange / parseFloat(data.open)) * 100).toFixed(2);

            const stockListItem = `
              <h2 class="no-margins">$${data.close}</h2>
              <small>${data.symbol}</small>
              <div class="stat-percent">Daily ${changePercent}% <i class="fa ${dailyChange < 0 ? 'fa-level-down' : 'fa-level-up'}"></i></div>
            `;

            document.getElementById(itemId).innerHTML = stockListItem;
    }

    updateStockTicker();
