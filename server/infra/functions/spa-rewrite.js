// CloudFront Function (viewer request, default behavior only — /api/* and /media/* never run it).
// The client bucket is private, so there is no S3 website ErrorDocument to fall back on:
// extension-less paths are client-side routes and get the SPA shell.
function handler(event) {
  var request = event.request;
  var lastSegment = request.uri.substring(request.uri.lastIndexOf('/') + 1);
  if (lastSegment.indexOf('.') === -1) {
    request.uri = '/index.html';
  }
  return request;
}
