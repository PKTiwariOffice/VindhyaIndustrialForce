// ============================================================
// Vindhya Industrial Force — Serverless Function Stub
// ============================================================
// PURPOSE
// ----------
// This file is a placeholder for a Netlify serverless function.
// The site uses Netlify's *built-in form handling* (enabled by
// `data-netlify="true"` on the contact form in index.html), so no
// function is required for basic submissions.
//
// USE THIS STUB WHEN YOU NEED CUSTOM SUBMISSION LOGIC, e.g.:
//   - Send the submission to your email / CRM / Google Sheets
//   - Store entries in Netlify Blobs or an external database
//   - Validate with a CAPTCHA before accepting
//
// DEPLOYMENT
// ----------
// Netlify auto-detects functions when a file is exported or
// present in this directory. Deploy with:
//   netlify functions:invoke submit-form --payload '{"name":"test"}'

exports.handler = async (event) => {
  // Parse the form payload (application/x-www-form-urlencoded body
  // is the default for Netlify static forms).
  const params = event.queryStringParameters || {};

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      success: true,
      message: 'Vindhya Industrial Force — form handler stub is live.',
      received: Object.keys(params).length ? params : null,
      nextSteps: 'Optionally wire this function to email/CRM/webhook notification.'
    })
  };
};