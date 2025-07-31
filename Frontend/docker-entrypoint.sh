#!/bin/sh
#
# Frontend startup helper
#
# The Compose file passes FRONTEND_PORT (the host port you map
# to container port 80).  Default to 80 if it isn’t set.
#

PORT="${FRONTEND_PORT:-80}"
echo " Frontend is running on  http://localhost:${PORT}"

# Hand off to Nginx (same as the original CMD)
exec nginx -g 'daemon off;'
