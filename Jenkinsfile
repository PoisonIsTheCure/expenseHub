pipeline {
  agent any

  options {
    timestamps()
  }

  parameters {
    string(name: 'DEPLOY_HOST', defaultValue: '', description: 'Target server IP or hostname')
    string(name: 'DEPLOY_USER', defaultValue: 'root', description: 'SSH user for deployment')
    string(name: 'DEPLOY_PORT', defaultValue: '22', description: 'SSH port')
    string(name: 'REMOTE_APP_DIR', defaultValue: '/opt/expensehub', description: 'Remote app directory containing docker-compose.yml')
    string(name: 'REMOTE_NGINX_DIR', defaultValue: '/etc/nginx/conf.d', description: 'Remote nginx config directory')
    string(name: 'REMOTE_NGINX_FILENAME', defaultValue: 'expensehub.conf', description: 'Remote nginx config file name')
    string(name: 'SERVER_NAME', defaultValue: 'example.com', description: 'Nginx server_name')
    string(name: 'NGINX_LISTEN_PORT', defaultValue: '80', description: 'Nginx listen port')
    string(name: 'FRONTEND_PORT', defaultValue: '3000', description: 'Published frontend container port on server')
    string(name: 'BACKEND_PORT', defaultValue: '5000', description: 'Published backend container port on server')
    string(name: 'DB_PORT', defaultValue: '27017', description: 'Published MongoDB container port on server')
    string(name: 'DB_DATA_PATH', defaultValue: '/opt/expensehub/data/mongodb', description: 'Host path for MongoDB data files')
    string(name: 'MAIL_RECIPIENTS', defaultValue: '', description: 'Optional comma-separated email recipients for deployment status')
  }

  environment {
    ANSIBLE_HOST_KEY_CHECKING = 'False'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Validate Input') {
      steps {
        script {
          if (!params.DEPLOY_HOST?.trim()) {
            error('DEPLOY_HOST is required.')
          }
          if (!params.SERVER_NAME?.trim()) {
            error('SERVER_NAME is required.')
          }
        }
      }
    }

    stage('Validate Tooling') {
      steps {
        sh 'ansible-playbook --version'
      }
    }

    stage('Prepare Ansible Files') {
      steps {
        withCredentials([sshUserPrivateKey(credentialsId: 'expensehub-deploy-ssh-key', keyFileVariable: 'SSH_KEY_FILE')]) {
          sh '''
            set -eu
            mkdir -p ansible/inventory ansible/vars

            cat > ansible/inventory/production.ini <<EOF
[production]
web1 ansible_host=${DEPLOY_HOST} ansible_user=${DEPLOY_USER} ansible_python_interpreter=/usr/bin/python3

[production:vars]
ansible_ssh_private_key_file=${SSH_KEY_FILE}
ansible_port=${DEPLOY_PORT}
EOF

            cat > ansible/vars/production.yml <<EOF
---
nginx_conf_template: templates/expensehub.conf.j2
nginx_conf_dir: ${REMOTE_NGINX_DIR}
nginx_conf_filename: ${REMOTE_NGINX_FILENAME}
nginx_server_name: ${SERVER_NAME}
nginx_listen_port: ${NGINX_LISTEN_PORT}
frontend_port: ${FRONTEND_PORT}
backend_port: ${BACKEND_PORT}
db_port: ${DB_PORT}
EOF
          '''
        }
      }
    }

    stage('Deploy Docker Services') {
      steps {
        withCredentials([sshUserPrivateKey(credentialsId: 'expensehub-deploy-ssh-key', keyFileVariable: 'SSH_KEY_FILE')]) {
          sh '''
            set -eu
            ssh -i "$SSH_KEY_FILE" -p "${DEPLOY_PORT}" -o StrictHostKeyChecking=no "${DEPLOY_USER}@${DEPLOY_HOST}" \
              "mkdir -p '${DB_DATA_PATH}' && cd '${REMOTE_APP_DIR}' && \
               FRONTEND_PORT='${FRONTEND_PORT}' BACKEND_PORT='${BACKEND_PORT}' DB_PORT='${DB_PORT}' DB_DATA_PATH='${DB_DATA_PATH}' \
               docker compose up -d --build mongodb backend frontend"
          '''
        }
      }
    }

    stage('Deploy Nginx Config') {
      steps {
        sh 'ansible-playbook -i ansible/inventory/production.ini ansible/deploy-nginx.yml'
      }
    }
  }

  post {
    success {
      script {
        def message = "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER} deployed Docker services + host nginx to ${params.DEPLOY_HOST}"
        currentBuild.description = message
        echo message

        if (params.MAIL_RECIPIENTS?.trim()) {
          mail(
            to: params.MAIL_RECIPIENTS,
            subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: """Deployment succeeded.

Job: ${env.JOB_NAME}
Build: #${env.BUILD_NUMBER}
Target host: ${params.DEPLOY_HOST}
Nginx file: ${params.REMOTE_NGINX_FILENAME}
server_name: ${params.SERVER_NAME}
Frontend port: ${params.FRONTEND_PORT}
Backend port: ${params.BACKEND_PORT}
MongoDB port: ${params.DB_PORT}

Build URL: ${env.BUILD_URL}
"""
          )
        }
      }
    }

    failure {
      script {
        def message = "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER} failed while deploying services/nginx to ${params.DEPLOY_HOST}"
        currentBuild.description = message
        echo message

        if (params.MAIL_RECIPIENTS?.trim()) {
          mail(
            to: params.MAIL_RECIPIENTS,
            subject: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: """Deployment failed.

Job: ${env.JOB_NAME}
Build: #${env.BUILD_NUMBER}
Target host: ${params.DEPLOY_HOST}
Nginx file: ${params.REMOTE_NGINX_FILENAME}
server_name: ${params.SERVER_NAME}
Frontend port: ${params.FRONTEND_PORT}
Backend port: ${params.BACKEND_PORT}
MongoDB port: ${params.DB_PORT}

Check logs: ${env.BUILD_URL}
"""
          )
        }
      }
    }
  }
}
