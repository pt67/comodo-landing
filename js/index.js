// Initially hide both app and web-app content
document.querySelector('.web-app').style.display = 'none';
document.querySelector('.app').style.display = 'none';

// Show loader initially
const loader = document.getElementById('loader');

// Check if it's running in Cordova environment
document.addEventListener('deviceready', onDeviceReady, false);

// For web browser environment with smooth fade-in effect
setTimeout(() => {
    if (!window.cordova) {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.5s ease';
        document.querySelector('.web-app').style.display = 'block';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
}, 1000);

// Wait for deviceready event before showing app content
function onDeviceReady() {
    if (window.FirebasePlugin) {
        loader.style.display = 'none';
        document.querySelector('.app').style.display = 'block';
    } else {
        loader.style.display = 'none';
        document.querySelector('.web-app').style.display = 'block';
    }
    // ...rest of your onDeviceReady function
}

let firebaseConnected = false;
let lastVisibleDocument = null; // Track the last visible document for pagination
const pageSize = 5; // Number of documents to load per page

function onDeviceReady() {
    const connectedElem = document.getElementById("connected");

    FirebasePlugin.getInstallationId(
        function (id) {
            console.log("Got installation ID: " + id);
            connectedElem.textContent = `Firebase Connected (Installation ID: ${id})`;
            connectedElem.style.color = "green";
            firebaseConnected = true; // Set the connection status
            fetchEquipmentList('dal_data');
        },
        function (error) {
            console.error("Failed to get installation ID", error);
            connectedElem.textContent = `Firebase NOT Connected - ${error}`;
            connectedElem.style.color = "red";
            firebaseConnected = false; // Set the connection status
        }
    );
}

//fetching equipment list from firestore
function fetchEquipmentList(collectionName){
    FirebasePlugin.fetchFirestoreCollection(
    collectionName,
    [],
    function (items) {
        console.log("Successfully fetched collection: " + JSON.stringify(items) );
        document.getElementById("data").innerHTML = ""; // Clear previous data
        for(key in items){
            const item = items[key];
            //control items length
            if (Object.keys(items).length > pageSize) {
                document.getElementById("data").innerHTML = `<p>Too many items to display. Please refine your search.</p>`;
                return;
            }
            document.getElementById("data").innerHTML += `
            <ul>
                <li>
                    <strong> ${item.serial_number} </strong><br>
                    <button id="edit-${key}" class="edit" data-id="${key}">Edit</button>
                    <button id="delete-${key}" class="delete" data-id="${key}">Delete</button>
                    <button id="view-${key}" class="view" data-id="${key}">View</button>
                </li>
            </ul>`;
        }
    },
    function (error) {
        console.error("Error fetching collection: " + error);
        document.getElementById("data").innerHTML = `<p>Error fetching data: ${error}</p>`;
    }
);
}

// Event delegation for dynamically created buttons
document.getElementById("data").addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("edit")) {
        const documentId = e.target.getAttribute("data-id"); // Use data-id to get the document ID
        // alert(`Fetching data for document ID: ${documentId}`);
        
        FirebasePlugin.fetchDocumentInFirestoreCollection(
            documentId,
            'dal_data',
            function (doc) {
                // Populate the input field with the fetched data
                document.getElementById("name").value = doc.name || ""; // Assuming 'name' is a field in the document
                document.getElementById("serial").value = doc.serial_number || ""; // Assuming 'serial_number' is a field in the document
                document.getElementById("location").value = doc.location; // Assuming 'location' is a field in the document
                document.getElementById("user_id").value = doc.emp_id; // Assuming 'emp_id' is a field in the document
                document.getElementById("device_id").value = documentId; // Set the document ID in the serial input field
                document.getElementById("issued_date").value = doc.issued_date; // Hide the device ID input field
                // Show only the Update button
                document.getElementById("updateId").style.display = "block"; 
                document.getElementById("issueButton").style.display = "none"; 
                document.getElementById("returnButton").style.display = "none"; 

            },
            function (error) {
                console.error("Error fetching document: " + error);
            }
        );
    }
});

//check dom document available or not


// Ensure the "Update" button event listener is always attached
document.getElementById("updateId").addEventListener("click", function () {
    const documentId = document.getElementById("device_id").value; // Get the document ID from the input field

    // Prepare the data to update
    const updatedData = {
        name: document.getElementById("name").value,
        serial_number: document.getElementById("serial").value,
        location: document.getElementById("location").value,
        emp_id: document.getElementById("user_id").value,
        issued_date: document.getElementById("issued_date").value
    };

    // Call the function to update the document
    FirebasePlugin.updateDocumentInFirestoreCollection(
        documentId, // Pass the document ID
        updatedData, // Pass the updated data
        "dal_data", // Pass the collection name first (if required by the API)
        true, // Merge flag
        function () {
            console.log("Successfully updated document with id=" + documentId);
            alert("Document updated successfully!");
        },
        function (error) {
            console.error("Error updating document: " + error);
            alert("Failed to update document: " + error);
        }
    );
});



// make working for searching serial number.
document.getElementById("searchButton").addEventListener("click", function () {
    const searchTerm = document.getElementById("searchInput").value.trim();
    if (searchTerm) {
        const collection = "dal_data";
        const filters = [
            ["where", "serial_number", "==", searchTerm]
        ];

        FirebasePlugin.fetchFirestoreCollection(
            collection,
            filters,
            function (documents) {
                console.log("Search results: " + JSON.stringify(documents));
                document.getElementById("data").innerHTML = ""; // Clear previous data
                if (Object.keys(documents).length === 0) {
                    document.getElementById("data").innerHTML = `<p>No items found for "${searchTerm}".</p>`;
                } else {
                    for (const key in documents) {
                        const item = documents[key];
                        document.getElementById("data").innerHTML += `
                        <ul>
                            <li>
                                <strong> ${item.serial_number} </strong><br>
                                <button id="edit-${key}" class="edit" data-id="${key}">Edit</button>
                                <button id="delete-${key}" class="delete" data-id="${key}">Delete</button>
                                <button id="view-${key}" class="view" data-id="${key}">View</button>
                            </li>
                        </ul>`;
                    }
                }
            },
            function (error) {
                console.error("Error searching collection: " + error);
                document.getElementById("data").innerHTML = `<p>Error searching data: ${error}</p>`;
            }
        );
    } else {
        alert("Please enter a serial number to search.");
    }
});

// MAKE ISSUE BUTTON WORKING
document.getElementById("issueButton").addEventListener("click", function () {
    const deviceName = document.getElementById("name").value.trim();
    const serialNumber = document.getElementById("serial").value.trim();
    const location = document.getElementById("location").value.trim();
    const userId = document.getElementById("user_id").value.trim();
    const issuedDate = document.getElementById("issued_date").value.trim();

    if (serialNumber && location && userId && issuedDate) {
        const newDocument = {
            name: deviceName,
            serial_number: serialNumber,
            location: location,
            emp_id: userId,
            issued_date: issuedDate
        };

        FirebasePlugin.addDocumentToFirestoreCollection(
            newDocument,
            "dal_data",
            function (docId) {
                console.log("Successfully added document with id=" + docId);
                alert("Document added successfully!");
                fetchEquipmentList('dal_data'); // Refresh the list after adding
            },
            function (error) {
                console.error("Error adding document: " + error);
                alert("Failed to add document: " + error);
            }
        );
    } else {
        alert("Please fill in all fields before issuing.");
    }
});

// Make the "View" button functional
document.getElementById("data").addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("view")) {
        const documentId = e.target.getAttribute("data-id"); // Use data-id to get the document ID
        FirebasePlugin.fetchDocumentInFirestoreCollection(
            documentId,
            'dal_data',
            function (doc) {
                // Populate the modal with the fetched data
                document.getElementById("modalName").textContent = doc.name || "N/A";
                document.getElementById("modalSerial").textContent = doc.serial_number || "N/A";
                document.getElementById("modalLocation").textContent = doc.location || "N/A";
                document.getElementById("modalUserId").textContent = doc.emp_id || "N/A";
                document.getElementById("modalIssuedDate").textContent = doc.issued_date || "N/A";

                // Show the modal
                document.getElementById("viewModal").style.display = "block";
            },
            function (error) {
                console.error("Error fetching document: " + error);
                alert("Failed to fetch document details.");
            }
        );
    }
});

// Close the modal
document.getElementById("closeModal").addEventListener("click", function () {
    document.getElementById("viewModal").style.display = "none";
});


//now make delete button working
document.getElementById("data").addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("delete")) {
        const documentId = e.target.getAttribute("data-id"); // Use data-id to get the document ID
        if (confirm("Are you sure you want to delete this item?")) {
            FirebasePlugin.deleteDocumentFromFirestoreCollection(
                documentId,
                'dal_data',
                function () {
                    console.log("Successfully deleted document with id=" + documentId);
                    alert("Document deleted successfully!");
                    fetchEquipmentList('dal_data'); // Refresh the list after deletion
                },
                function (error) {
                    console.error("Error deleting document: " + error);
                    alert("Failed to delete document: " + error);
                }
            );
        }
    }
});

// Remove the old scroll button code and replace with this:
document.addEventListener('DOMContentLoaded', function() {
    const scrollToTopButton = document.getElementById('scrollToTop');
    
    function handleScroll() {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        
        if (scrollPosition > 300) {
            scrollToTopButton.style.opacity = '1';
            scrollToTopButton.style.visibility = 'visible';
        } else {
            scrollToTopButton.style.opacity = '0';
            scrollToTopButton.style.visibility = 'hidden';
        }
    }

    // Initial check
    handleScroll();

    // Add scroll event listener with throttling
    let isScrolling = false;
    window.addEventListener('scroll', function() {
        if (!isScrolling) {
            window.requestAnimationFrame(function() {
                handleScroll();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });

    // Scroll to top when clicked
    scrollToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

// Service Worker and PWA Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Cookie Consent
function checkCookieConsent() {
    if (!localStorage.getItem('cookieConsent')) {
        const cookieConsent = document.createElement('div');
        cookieConsent.id = 'cookieConsent';
        cookieConsent.innerHTML = `
            <p>We use cookies to improve your experience. By continuing to use this site, you agree to our cookie policy.</p>
            <button onclick="acceptCookies()">Accept</button>
        `;
        document.body.appendChild(cookieConsent);
        cookieConsent.style.display = 'flex';
    }
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'true');
    document.getElementById('cookieConsent').style.display = 'none';
}

// Call cookie consent check when DOM is loaded
document.addEventListener('DOMContentLoaded', checkCookieConsent);

// Bottom Navigation
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    
    // Function to update active state based on scroll position
    function updateActiveState() {
        const scrollPosition = window.scrollY;
        const sections = {
            'home': 0,
            'search_area': document.getElementById('search_area')?.offsetTop - 100,
            'dataForm': document.getElementById('dataForm')?.offsetTop - 100,
            'data': document.getElementById('data')?.offsetTop - 100
        };

        // Find the current section
        let currentSection = 'home';
        Object.entries(sections).forEach(([section, position]) => {
            if (scrollPosition >= position) {
                currentSection = section;
            }
        });

        // Update active state
        navItems.forEach(item => {
            const href = item.getAttribute('href').substring(1);
            if (href === currentSection || (href === '' && currentSection === 'home')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Add click event listeners
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get the target section
            const targetId = this.getAttribute('href').substring(1);
            if (!targetId) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                // Add offset for bottom navigation
                const offset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Handle specific sections
                switch(targetId) {
                    case 'search_area':
                        document.getElementById('searchInput').focus();
                        break;
                    case 'dataForm':
                        // Reset form and show Issue button
                        document.getElementById('dataForm').reset();
                        document.getElementById('updateId').style.display = 'none';
                        document.getElementById('issueButton').style.display = 'block';
                        document.getElementById('name').focus();
                        break;
                    case 'data':
                        // Refresh the equipment list
                        if (firebaseConnected) {
                            fetchEquipmentList('dal_data');
                        }
                        break;
                }
            }
        });
    });

    // Update active state on scroll
    window.addEventListener('scroll', () => {
        if (!window.scrollTimeout) {
            window.scrollTimeout = setTimeout(() => {
                updateActiveState();
                window.scrollTimeout = null;
            }, 100);
        }
    });

    // Initial active state
    updateActiveState();
});

