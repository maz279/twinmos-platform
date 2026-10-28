#!/bin/sh
# Lab-only PKI: a stand-in for Cloudflare's origin-pull CA plus a server cert for
# www.twinmos.com. Lets the lab exercise the REAL `ssl_verify_client on` config
# instead of switching it off. Never used outside tooling/audit-zt/lab.
set -eu
d=${CERT_OUT:-/certs}
# marker is our own CA key: the edge image pre-fills this volume with its self-signed pair
[ -f "$d/ca.key" ] && exit 0
apk add --no-cache openssl >/dev/null
cd "$d"
openssl req -x509 -nodes -newkey rsa:2048 -days 30 -subj "/CN=lab-origin-pull-ca" -keyout ca.key -out ca.pem
openssl req -nodes -newkey rsa:2048 -subj "/CN=lab-cloudflare-client" -keyout client.key -out client.csr
openssl x509 -req -in client.csr -CA ca.pem -CAkey ca.key -CAcreateserial -days 30 -out client.pem
printf "subjectAltName=DNS:www.twinmos.com,DNS:twinmos.com\n" > san.ext
openssl req -nodes -newkey rsa:2048 -subj "/CN=www.twinmos.com" -keyout server.key -out server.csr
openssl x509 -req -in server.csr -CA ca.pem -CAkey ca.key -CAcreateserial -days 30 -extfile san.ext -out server.pem
chmod 644 ./*.pem ./*.key
# File names nginx (deploy/nginx/twinmos.conf) expects:
cp server.pem twinmos.pem && cp server.key twinmos.key && cp ca.pem cloudflare-origin-pull-ca.pem
