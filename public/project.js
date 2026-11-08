// Project guide: step-by-step checklist (rendered in the "🛠 Project guide" view).
window.PROJECT = {
title: "Terraform + Ansible: deploy an app on AWS end to end",
intro: "Ithu un portfolio project kutty. Terraform la AWS infra, Ansible la server setup + app deploy, GitHub Actions la automation. Ovvoru step mudinjadhum ✔ tick pannu. Lesson 18 la Malli Akka ithe project ah explain pannuvaanga. ⚠ Free tier mattum use pannu, mudinjadhum terraform destroy!",
steps: [
{t:"1. Tools install pannu", d:"Terraform, AWS CLI, Ansible install pannu. Versions check pannu.",
 c:`sudo apt install -y terraform awscli
pipx install --include-deps ansible
terraform version && aws --version && ansible --version`},
{t:"2. AWS safe setup", d:"Root ku MFA, IAM user, aws configure, $1 budget alert. EC2 key pair create panni .pem file ah ~/.ssh la vei.",
 c:`aws configure            # region: ap-south-1
aws sts get-caller-identity
aws ec2 create-key-pair --key-name kutty-key --query KeyMaterial --output text > ~/.ssh/kutty-key.pem
chmod 400 ~/.ssh/kutty-key.pem`},
{t:"3. Repo structure", d:"GitHub la pudhu repo, terraform/ um ansible/ um thaniya folders.",
 c:`tf-ansible-project/
  terraform/  main.tf  variables.tf  outputs.tf  inventory.tf  inventory.tpl  backend.tf
  ansible/    ansible.cfg  site.yml  requirements.yml  group_vars/
  .github/workflows/
  README.md`},
{t:"4. Remote state backend", d:"State ku S3 bucket (versioning on) create pannu, backend.tf la podu.",
 c:`aws s3api create-bucket --bucket kutty-tf-state-<unique> --region ap-south-1 \\
  --create-bucket-configuration LocationConstraint=ap-south-1
aws s3api put-bucket-versioning --bucket kutty-tf-state-<unique> --versioning-configuration Status=Enabled

# terraform/backend.tf
terraform {
  backend "s3" {
    bucket       = "kutty-tf-state-<unique>"
    key          = "project/terraform.tfstate"
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = true
  }
}`},
{t:"5. Network + security group", d:"VPC module (public subnets) + web security group (80 ellaarukkum, 22 un IP ku mattum).",
 c:`module "vpc" {
  source         = "terraform-aws-modules/vpc/aws"
  version        = "~> 5.0"
  name           = "kutty-vpc"
  cidr           = "10.0.0.0/16"
  azs            = ["ap-south-1a", "ap-south-1b"]
  public_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
}

resource "aws_security_group" "web" {
  vpc_id = module.vpc.vpc_id
  ingress { from_port = 80, to_port = 80, protocol = "tcp", cidr_blocks = ["0.0.0.0/0"] }
  ingress { from_port = 22, to_port = 22, protocol = "tcp", cidr_blocks = [var.my_ip] }
  egress  { from_port = 0, to_port = 0, protocol = "-1", cidr_blocks = ["0.0.0.0/0"] }
}`},
{t:"6. EC2 × 2 with data source", d:"Latest Ubuntu AMI data source vechu, count = 2 servers.",
 c:`data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
}

resource "aws_instance" "web" {
  count                  = 2
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  key_name               = "kutty-key"
  subnet_id              = module.vpc.public_subnets[count.index]
  vpc_security_group_ids = [aws_security_group.web.id]
  associate_public_ip_address = true
  tags = { Name = "web-\${count.index}" }
}

output "web_ips" { value = aws_instance.web[*].public_ip }`},
{t:"7. Inventory auto-generate", d:"Terraform output IPs la irunthu Ansible inventory file create aagum.",
 c:`# terraform/inventory.tpl
[web]
%{ for ip in web_ips ~}
\${ip}
%{ endfor ~}

[web:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=~/.ssh/kutty-key.pem

# terraform/inventory.tf
resource "local_file" "inventory" {
  filename = "../ansible/inventory.ini"
  content  = templatefile("inventory.tpl", { web_ips = aws_instance.web[*].public_ip })
}`},
{t:"8. terraform apply", d:"init, fmt, validate, plan, apply. Inventory file ready ah nu paaru.",
 c:`cd terraform
terraform init && terraform fmt && terraform validate
terraform plan -out=tfplan
terraform apply tfplan
cat ../ansible/inventory.ini`},
{t:"9. Ansible setup", d:"ansible.cfg, requirements install, ping test (servers boot aaga 1 nimisham wait pannu).",
 c:`# ansible/ansible.cfg
[defaults]
inventory = inventory.ini
host_key_checking = False

# ansible/requirements.yml
roles:
  - { name: geerlingguy.docker, version: 7.4.1 }
collections:
  - { name: community.docker }

cd ../ansible
ansible-galaxy install -r requirements.yml
ansible-galaxy collection install -r requirements.yml
ansible all -m ping`},
{t:"10. Deploy playbook", d:"Docker install + app container. Idempotent ah irukkanum: rendaavathu run la changed=0.",
 c:`# ansible/site.yml
- hosts: web
  become: true
  roles:
    - geerlingguy.docker
  tasks:
    - name: Run app container
      community.docker.docker_container:
        name: app
        image: nginxdemos/hello:latest
        ports: ["80:80"]
        restart_policy: always

ansible-playbook site.yml
ansible-playbook site.yml     # 2nd run: changed=0 ✔`},
{t:"11. Verify", d:"Rendu IPs layum curl pannu. Browser la um open pannu.",
 c:`for ip in $(cd ../terraform && terraform output -json web_ips | jq -r '.[]'); do
  curl -s http://$ip | grep -o '<title>.*</title>'
done`},
{t:"12. Secrets with Vault (bonus)", d:"App ku oru secret env variable venum na Ansible Vault la encrypt pannu.",
 c:`ansible-vault create group_vars/web/vault.yml    # vault_app_secret: xyz
# site.yml task: env: { APP_SECRET: "{{ vault_app_secret }}" }
ansible-playbook site.yml --ask-vault-pass`},
{t:"13. GitHub Actions CI", d:"PR la terraform fmt/validate/plan + checkov + ansible-lint. AWS ku OIDC role (keys illa).",
 c:`# .github/workflows/ci.yml
on: [pull_request]
permissions: { id-token: write, contents: read }
jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - run: cd terraform && terraform fmt -check && terraform init -backend=false && terraform validate
      - run: pipx install checkov && checkov -d terraform
      - run: pipx install ansible-lint && ansible-lint ansible/site.yml`},
{t:"14. README + screenshots", d:"Architecture diagram, steps, curl output screenshot, 'Problems I faced' section. Interview la idha kaattu.",
 c:`README.md
  ## Architecture: Terraform (VPC, SG, 2× EC2) ➜ inventory ➜ Ansible (Docker + app)
  ## How to run
  ## What I learned / problems I fixed
  ## Cleanup: terraform destroy`},
{t:"15. Cleanup!", d:"Bill varaama irukka ellaam destroy pannu. State bucket ah vechukkalaam (kaasu romba kammi).",
 c:`cd terraform && terraform destroy
aws ec2 describe-instances --query "Reservations[].Instances[].State.Name"   # terminated ✔`}
]};
