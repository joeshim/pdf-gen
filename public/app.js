// app.js
function submitForm() {
    const data = {
        text1: document.getElementById('text1').value,
        text2: document.getElementById('text2').value,
        text: document.getElementById('text').value,
        newText: document.getElementById('newText').value,
        addressNumber: document.getElementById('addressNumber').value,
        addressInfo: document.getElementById('addressInfo').value,
        mobile: document.getElementById('mobile').value,
        email: document.getElementById('email').value,
        tel: document.getElementById('tel').value,
        fax: document.getElementById('fax').value,
    };

    fetch('/generate-pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.open('/output.pdf', '_blank');
        } else {
            console.error('Failed to generate PDF:', data.message);
        }
    })
    .catch(err => console.error('Error:', err));
}
