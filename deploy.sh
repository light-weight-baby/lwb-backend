#!/bin/bash
npm run install && npm run build && sudo systemctl restart nginx && npm run production
