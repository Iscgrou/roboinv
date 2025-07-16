# express-gateway.yml
http:
  port: 9000
serviceEndpoints:
  representative-management-service:
    url: http://representative-management-service:3001
policies:
  - basic-auth:
      # Placeholder: Implement actual basic authentication logic later
      - basic-auth
pipelines:
  default:
    apiEndpoints:
      - api
    policies:
      - basic-auth:
          - action:
              # Placeholder: Replace with actual authentication logic
              pass: true
      - proxy:
          - action:
              serviceEndpoint: representative-management-service
              changeOrigin: true
apiEndpoints:
  api:
    paths: '/representatives*'
