// Level Up lessons (mid-level topics), shown after interview prep, with their practice tasks and quizzes.
window.LVL = ({ B, T, Li, Y }) => {
const lessons = [
{g:"Level Up",t:"Provider aliases: multi-region & multi-account",k:"alias assume_role",s:[
["Vanakkam kutty! Level up section ku welcome. Company la orey account, orey region la mattum velai nadakkaadhu. Mumbai la app, Singapore la backup, dev um prod um thaniya accounts. Epdi?",B("🌏 Multi-region / account","Provider aliases")],
["Provider block ku alias kuduthaa, orey code la rendu providers vekkalaam. Default Mumbai, alias vechu Singapore.",Y("providers.tf",["provider \"aws\" {",""],["  region = \"ap-south-1\"","default"],["}",""],["provider \"aws\" {",""],["  alias  = \"sg\"","second per"],["  region = \"ap-southeast-1\"","Singapore"],["}",""])],
["Resource la provider argument vechu endha provider nu sollu. Kudukkala na default use aagum.",Y("backup.tf",["resource \"aws_s3_bucket\" \"backup\" {",""],["  provider = aws.sg","Singapore la"],["  bucket   = \"kutty-backup-sg\"",""],["}",""])],
["Vera account ku assume role. Prod account la oru role, dev account la irunthu adha assume pannuvom. Keys share panna vendaam.",Y("providers.tf",["provider \"aws\" {",""],["  alias  = \"prod\"",""],["  region = \"ap-south-1\"",""],["  assume_role {",""],["    role_arn = \"arn:aws:iam::222233334444:role/terraform-deploy\"","prod account role"],["  }",""],["}",""])],
["Module ku provider pass panna providers map. Module kulla configuration aliases declare pannanum.",Y("main.tf",["module \"dr_vpc\" {",""],["  source    = \"./modules/vpc\"",""],["  providers = { aws = aws.sg }","Singapore provider"],["}",""])],
["Use cases: disaster recovery ku vera region, CloudFront certificate us east 1 la kandippa, central logging account, Route 53 vera account la.",Li("Use cases",["DR","second region"],["ACM for CloudFront","us-east-1 kandippa"],["Logging","central account"],["DNS","shared account"])],
["Plan la address paaru, provider theriyum. Rendu region resources um orey plan la.",T(["terraform plan","  # aws_s3_bucket.backup will be created\n  + resource \"aws_s3_bucket\" \"backup\" {\n      + bucket = \"kutty-backup-sg\"\n      + region = \"ap-southeast-1\"\nPlan: 2 to add, 0 to change, 0 to destroy."])],
["Recap kutty: alias rendu providers, resource la provider equals aws dot alias, assume role vera account, module ku providers map. Interview la multi account kettaa idhu thaan answer!",Li("Recap",["alias","second provider"],["provider = aws.sg","use"],["assume_role","cross-account"],["providers = {}","module ku pass"])]]},

{t:"Terraform test, policy as code, provisioners",k:"terraform test opa",s:[
["Hai kutty! Code ku test ezhudhura maathiri, Terraform ku um test ezhudhalaam. Apram company rules ah code ah enforce pannalaam. Inniki rendum.",B("🧪 Test + Policy","Safe Terraform")],
["Terraform test framework. Dot tftest dot hcl file la run blocks. Plan illa apply panni assert pannum.",Y("tests/bucket.tftest.hcl",["variables { env = \"test\" }",""],["run \"bucket_name_has_env\" {",""],["  command = plan","plan mattum, create illa"],["  assert {",""],["    condition     = aws_s3_bucket.notes.bucket == \"kutty-notes-test\"","check"],["    error_message = \"Bucket name must include env\"",""],["  }",""],["}",""])],
["terraform test command ella tests aiyum odavikkum. Pass fail kaattum.",T(["terraform test","tests/bucket.tftest.hcl... in progress\n  run \"bucket_name_has_env\"... pass\ntests/bucket.tftest.hcl... pass\nSuccess! 1 passed, 0 failed."])],
["Policy as code: company rules. Ellaa S3 encrypted ah irukkanum, t3 large ku mela instance koodaadhu, tags kandippa. OPA illa Sentinel la ezhudhuvom.",Li("Policy tools",["OPA / Conftest","open source, Rego language"],["Sentinel","HCP Terraform"],["checkov / trivy","ready-made security rules"])],
["OPA Rego example. Plan JSON ah padichu, public bucket irundha deny.",Y("policy/s3.rego",["package terraform",""],["deny[msg] {",""],["  r := input.resource_changes[_]",""],["  r.type == \"aws_s3_bucket_public_access_block\"",""],["  r.change.after.block_public_acls == false","rule"],["  msg := sprintf(\"%s must block public ACLs\", [r.address])",""],["}",""])],
["Plan ah JSON ah maathi conftest la check. CI la fail aana merge illa.",T(["terraform show -json tfplan > plan.json",""],["conftest test plan.json","FAIL - plan.json - main - aws_s3_bucket_public_access_block.notes must block public ACLs\n1 test, 0 passed, 1 failure"])],
["Provisioners, local exec, remote exec, last resort mattum. State la track aagaadhu, fail aanaa kashtam. Config ku Ansible illa user data, image ku Packer better.",Li("Provisioners",["local-exec / remote-exec","last resort"],["Problem","not idempotent, not in plan"],["Better","user_data, Ansible, Packer images"])],
["Recap kutty: terraform test run assert, OPA conftest Sentinel policies, checkov, provisioners avoid. Interview la provisioners yen avoid nu kandippa kekkuvaanga!",Li("Recap",["terraform test","assertions"],["OPA / Sentinel","policy as code"],["conftest","plan JSON check"],["provisioners","avoid"])]]},

{t:"Terragrunt basics",k:"terragrunt DRY",s:[
["Vanakkam kutty! Dev, staging, prod, moonu environments, ovvonnulayum backend config, provider config copy paste. Bore! Terragrunt adha DRY aakkum, Don't Repeat Yourself.",B("🧩 Terragrunt","Terraform wrapper, DRY")],
["Terragrunt Terraform mela oru thin wrapper. Backend, provider, common inputs ah orey idathula ezhudhi, ellaa environments um inherit pannum.",Li("Terragrunt",["What","Terraform wrapper (Gruntwork)"],["Solves","repeated backend/provider code"],["Bonus","run-all, dependencies"])],
["Folder structure. Root la common config, ovvoru environment folder la chinna terragrunt dot hcl.",Li("Structure",["root.hcl","backend + provider (once)"],["dev/vpc/terragrunt.hcl","dev inputs"],["prod/vpc/terragrunt.hcl","prod inputs"],["modules/vpc","Terraform module"])],
["Root file la remote state orey thadava. Key ah folder path la irunthu automatic ah generate pannum.",Y("root.hcl",["remote_state {",""],["  backend = \"s3\"",""],["  config = {",""],["    bucket = \"kutty-tf-state\"",""],["    key    = \"${path_relative_to_include()}/terraform.tfstate\"","auto key"],["    region = \"ap-south-1\"",""],["  }",""],["}",""])],
["Environment file romba chinnadhu. Include root, module source, inputs. Avlo thaan!",Y("prod/vpc/terragrunt.hcl",["include \"root\" { path = find_in_parent_folders(\"root.hcl\") }","common config"],["terraform { source = \"../../modules/vpc\" }","module"],["inputs = {",""],["  cidr = \"10.1.0.0/16\"","prod values"],["  env  = \"prod\"",""],["}",""])],
["Dependencies um sollalaam. App ku VPC output venum na dependency block. Run all ellaa folders um correct order la odavikkum.",T(["cd prod && terragrunt run-all plan","Group 1\n- Module prod/vpc\nGroup 2\n- Module prod/app\n...Plan: 12 to add"])],
["Venuma venaamaa? Chinna projects ku plain Terraform pothum. Neraya accounts, environments irundha Terragrunt romba useful. Interview la trade off sollu.",Li("Trade-off",["Plain Terraform","simple, fewer tools"],["Terragrunt","DRY across many envs/accounts"],["Alternative","HCP Terraform workspaces, Terraform stacks"])],
["Recap kutty: Terragrunt wrapper, root hcl la backend once, path relative key, include, inputs, dependency, run all. DRY infra!",Li("Recap",["include","inherit common"],["inputs","env values"],["dependency","outputs between stacks"],["run-all","many folders"])]]},

{t:"Ansible dynamic inventory (AWS)",k:"aws_ec2 plugin",s:[
["Hai kutty! Inventory la IPs kai la ezhudhunom la? Cloud la servers vandhu pogum, auto scaling la IP maarum. Kai la update panna mudiyaadhu. Dynamic inventory!",B("🔄 Dynamic inventory","AWS la irunthu live list")],
["amazon aws collection la aws ec2 inventory plugin irukku. Run pannum bodhu AWS API la servers ah thedi list pannum.",T(["ansible-galaxy collection install amazon.aws","amazon.aws:9.0.0 was installed successfully"],["pip install boto3 botocore","Successfully installed boto3"])],
["Inventory file per aws ec2 dot yml la mudiyanum. Region, filters, groups.",Y("inventory/aws_ec2.yml",["plugin: amazon.aws.aws_ec2",""],["regions: [ap-south-1]",""],["filters:",""],["  instance-state-name: running","odura servers mattum"],["  tag:Project: kutty","namma project"],["keyed_groups:",""],["  - key: tags.Role","Role tag ➜ group"],["    prefix: role",""],["hostnames: [ip-address]","public IP"])],
["Tags vechu groups automatic ah create aagum. Role web tag irukkura servers role web group la.",T(["ansible-inventory -i inventory/aws_ec2.yml --graph","@all:\n  |--@aws_ec2:\n  |--@role_web:\n  |  |--13.233.10.25\n  |  |--13.233.10.26\n  |--@role_db:\n  |  |--13.233.11.40"])],
["Playbook la group per use pannu. Terraform la tag pottaa pothum, Ansible thaane kandupidikkum!",Y("site.yml",["- hosts: role_web","tag based group"],["  become: true",""],["  roles: [nginx]",""])],
["AWS credentials Ansible ku venum. Laptop la aws configure, illa EC2 control node ku IAM role. Keys hardcode pannaadhe.",Li("Auth",["Laptop","aws configure / AWS_PROFILE"],["EC2 / CI","IAM role / OIDC"],["Never","keys in inventory file"])],
["Terraform plus Ansible project la inventory file generate panna vendaam ini. Tags pottaa pothum, idhu cleaner.",B("Terraform tags ➜ Ansible groups","templatefile venaam")],
["Recap kutty: amazon aws collection, aws ec2 plugin, filters, keyed groups tags la irunthu, graph la check, IAM role auth. Cloud la ithu thaan correct vazhi!",Li("Recap",["aws_ec2.yml","plugin config"],["filters","running + tags"],["keyed_groups","tag ➜ group"],["--graph","verify"])]]},

{t:"Rolling updates: serial, forks, delegate_to",k:"serial forks delegate_to",s:[
["Vanakkam kutty! Pathu web servers la pudhu version deploy pannanum. Ellaathaiyum orey neram update pannaa website down! Konjam konjam ah pannanum. Rolling update.",B("🔄 Rolling updates","Downtime illaama deploy")],
["serial vechu batch size. Serial rendu na rendu rendu servers ah update pannum. Percentage um kudukkalaam.",Y("deploy.yml",["- hosts: role_web",""],["  serial: 2","2 at a time"],["  # or: serial: [1, \"30%\", \"100%\"]","canary first"],["  tasks: [...]",""])],
["Max fail percentage: oru batch la indha percentage ku mela fail aanaa, matha servers ku pogaadhu. Bad release spread aagaadhu.",Y("deploy.yml",["  serial: 2",""],["  max_fail_percentage: 25","stop if > 25% fail"],["  any_errors_fatal: false",""])],
["Load balancer la irunthu server ah remove panni update, apram add. Andha task LB ah control panra machine la odanum. delegate to.",Y("deploy.yml",["- name: Remove from load balancer",""],["  community.aws.elb_target: { target_group_arn: \"{{ tg_arn }}\", target_id: \"{{ instance_id }}\", state: absent }",""],["  delegate_to: localhost","control node la odum"],["- name: Deploy new version",""],["  ansible.builtin.include_role: { name: app }",""],["- name: Add back to load balancer",""],["  community.aws.elb_target: { target_group_arn: \"{{ tg_arn }}\", target_id: \"{{ instance_id }}\", state: present }",""],["  delegate_to: localhost",""])],
["run once: oru task ah orey thadava mattum, eg database migration. Ellaa servers la odakoodaadhu.",Y("migrate",["- name: Run DB migration",""],["  ansible.builtin.command: /opt/app/migrate",""],["  run_once: true","orey thadava"])],
["forks na orey neram evlo servers kitta parallel ah pesum. Default anju. Neraya servers na yethalaam. Strategy free na ovvoru server um wait pannaama fast ah pogum.",Y("ansible.cfg",["[defaults]",""],["forks = 20","parallel connections"],["# play level: strategy: free","no waiting per task"])],
["Run pannaa batches ah theriyum.",T(["ansible-playbook deploy.yml","PLAY [role_web] (batch 1: 13.233.10.25, 13.233.10.26)\n...\nPLAY [role_web] (batch 2: 13.233.10.27, 13.233.10.28)\n...\nPLAY RECAP: ok=40 changed=16 failed=0"])],
["Recap kutty: serial batches, max fail percentage, delegate to LB control, run once migration, forks parallel, strategy free. Zero downtime Ansible deploy!",Li("Recap",["serial","batch size"],["max_fail_percentage","stop bad rollout"],["delegate_to","run elsewhere"],["run_once","once only"],["forks","parallelism"])]]},

{t:"AWX & Molecule testing",k:"awx molecule",s:[
["Hai kutty! Team la ellaarum laptop la playbook odavittaa yaar enna pannaanga nu theriyaadhu. AWX oru web UI, central ah odavikkalaam. Apram roles ah Molecule la test pannalaam.",B("🏢 AWX + 🧪 Molecule","Team scale Ansible")],
["AWX open source, Red Hat Ansible Automation Platform adhoda enterprise version. Web UI, API, RBAC, schedules, logs.",Li("AWX features",["Job templates","playbook + inventory + creds"],["RBAC","yaar run pannalaam"],["Credentials","encrypted vault"],["Schedules + logs","audit trail"])],
["Job template create pannu: endha project Git repo, endha playbook, endha inventory, endha credential. Apram button click illa API call.",T(["awx job_templates launch \"Deploy web\" --monitor","Launching job 42 ...\nPLAY RECAP: ok=40 changed=16 failed=0\nJob 42 successful"])],
["Survey vechu run pannum bodhu inputs kekkalaam, version number maathiri. Approval workflows um podalaam.",Li("Workflows",["Survey","runtime inputs"],["Workflow","job ➜ job chain"],["Approval","manual gate"],["Webhook","Git push ➜ run"])],
["Molecule na roles ku test framework. Docker container la role ah run panni, idempotent ah nu check panni, verify pannum.",T(["pip install molecule molecule-plugins[docker]","Successfully installed molecule"],["cd roles/nginx && molecule init scenario","INFO Initialized scenario default"])],
["molecule test full cycle: create container, converge na role run, idempotence check, verify, destroy.",T(["molecule test","INFO Running default > create\nINFO Running default > converge\nINFO Running default > idempotence\n  Idempotence completed successfully.\nINFO Running default > verify\nINFO Running default > destroy"])],
["Verify playbook la check: nginx installed ah, port 80 listen pannudha.",Y("molecule/default/verify.yml",["- hosts: all",""],["  tasks:",""],["    - ansible.builtin.package_facts:",""],["    - ansible.builtin.assert:",""],["        that: \"'nginx' in ansible_facts.packages\"","test"])],
["Recap kutty: AWX central UI, job templates, RBAC, credentials, surveys, workflows. Molecule create converge idempotence verify destroy. Ippo nee Ansible pro! Congratulations kutty, full course mudichitta!",B("🏆 Level Up done!","Terraform + Ansible pro")]]}
];

const practice = [
[["Plan pannu (rendu regions)","terraform plan",/^terraform plan$/,"Plan: 2 to add, 0 to change, 0 to destroy.","multi-region plan"],
 ["Singapore bucket state paaru","terraform state show aws_s3_bucket.backup",/^terraform state show ['"]?aws_s3_bucket\.backup['"]?$/,"region = \"ap-southeast-1\"","state"],
 ["Prod role assume aagudha nu CLI la test","aws sts assume-role --role-arn arn:aws:iam::222233334444:role/terraform-deploy --role-session-name test",/^aws sts assume-role (?=.*--role-arn[= ]arn:aws:iam::222233334444:role\/terraform-deploy)(?=.*--role-session-name[= ]\S+).*$/,"\"AssumedRoleUser\": { \"Arn\": \"arn:aws:sts::222233334444:assumed-role/terraform-deploy/test\" }","assume role"],
 ["Providers tree paaru","terraform providers",/^terraform providers$/,"provider[registry.terraform.io/hashicorp/aws]\n└── module.dr_vpc\n    └── provider[registry.terraform.io/hashicorp/aws]","providers"]],
[["Tests run","terraform test",/^terraform test$/,"Success! 1 passed, 0 failed.","terraform test"],
 ["Plan ah JSON ah","terraform show -json tfplan > plan.json",/^terraform show -json tfplan > ?plan\.json$/,"","plan JSON"],
 ["Conftest policy check","conftest test plan.json",/^conftest test plan\.json( -p \S+)?$/,"FAIL - ... must block public ACLs","policy"],
 ["tflint run","tflint",/^tflint( --recursive)?$/,"1 issue(s) found:\nWarning: instance type t2.micro is previous generation","lint"]],
[["prod la plan (ellaa modules)","terragrunt run-all plan",/^terragrunt run-all plan$/,"Group 1\n- Module prod/vpc\nGroup 2\n- Module prod/app","run-all"],
 ["oru module plan","terragrunt plan",/^terragrunt plan$/,"Plan: 6 to add, 0 to change, 0 to destroy.","plan"],
 ["oru module apply","terragrunt apply",/^terragrunt apply$/,"Apply complete! Resources: 6 added.","apply"],
 ["Terragrunt files format","terragrunt hclfmt",/^terragrunt hclfmt$/,"","format"]],
[["amazon.aws collection install","ansible-galaxy collection install amazon.aws",/^ansible-galaxy collection install amazon\.aws$/,"amazon.aws:9.0.0 was installed successfully","collection"],
 ["Dynamic inventory graph","ansible-inventory -i inventory/aws_ec2.yml --graph",/^ansible-inventory -i inventory\/aws_ec2\.yml --graph$/,"@role_web:\n  |--13.233.10.25\n  |--13.233.10.26","graph"],
 ["role_web group ping","ansible role_web -i inventory/aws_ec2.yml -m ping",/^ansible role_web -i inventory\/aws_ec2\.yml -m ping$/,"13.233.10.25 | SUCCESS => { \"ping\": \"pong\" }","ping group"],
 ["Inventory full list (JSON)","ansible-inventory -i inventory/aws_ec2.yml --list",/^ansible-inventory -i inventory\/aws_ec2\.yml --list$/,"{ \"role_web\": { \"hosts\": [\"13.233.10.25\", \"13.233.10.26\"] } }","list"]],
[["Rolling deploy run","ansible-playbook deploy.yml",/^ansible-playbook (-i \S+ )?deploy\.yml$/,"PLAY [role_web] (batch 1) ...\nPLAY [role_web] (batch 2) ...","serial run"],
 ["20 forks oda run","ansible-playbook deploy.yml --forks 20",/^ansible-playbook deploy\.yml (-f|--forks)[ =]20$/,"(20 parallel connections)","forks"],
 ["Canary: oru host mattum mudhalla","ansible-playbook deploy.yml --limit 13.233.10.25",/^ansible-playbook deploy\.yml --limit[= ]13\.233\.10\.25$/,"13.233.10.25 : ok=10 changed=4 failed=0","canary"],
 ["Hosts list (batches plan)","ansible-playbook deploy.yml --list-hosts",/^ansible-playbook deploy\.yml --list-hosts$/,"  play #1 (role_web): hosts (4):\n    13.233.10.25\n    13.233.10.26 ...","list hosts"]],
[["AWX job launch","awx job_templates launch \"Deploy web\" --monitor",/^awx job_templates launch ['"]Deploy web['"]( --monitor)?$/,"Job 42 successful","AWX launch"],
 ["Molecule scenario init","molecule init scenario",/^molecule init scenario( default)?$/,"INFO Initialized scenario default","molecule init"],
 ["Full molecule test","molecule test",/^molecule test$/,"Idempotence completed successfully.","molecule test"],
 ["Role ah container la run mattum","molecule converge",/^molecule converge$/,"INFO Running default > converge\nPLAY RECAP: ok=5 changed=3","converge"]]
];

const quiz = [
[["Second provider ku?","alias","name","id"],
 ["Resource la alias use?","provider = aws.sg","region = sg","alias = sg"],
 ["Cross-account ku?","assume_role","copy keys","new state"],
 ["Module ku provider pass?","providers = { aws = aws.sg }","provider = sg","inputs"],
 ["CloudFront ACM cert region?","us-east-1","ap-south-1","Any"]],
[["Terraform tests file?",".tftest.hcl",".test.tf","test.yaml"],
 ["Plan mattum test?","command = plan","mode = dry","plan = true"],
 ["Open-source policy engine?","OPA (Rego)","Sentinel","Jenkins"],
 ["Provisioners?","Last resort","Best practice","Required"],
 ["Plan JSON ah check?","conftest","terraform policy","grep"]],
[["Terragrunt goal?","DRY across envs","Replace Terraform","Monitoring"],
 ["Common config include?","find_in_parent_folders","import","source"],
 ["Many folders orey command?","run-all","apply-all-now","multi"],
 ["Small project ku?","Plain Terraform pothum","Terragrunt kandippa","Ansible"],
 ["State key auto?","path_relative_to_include()","random()","uuid()"]],
[["AWS dynamic inventory plugin?","amazon.aws.aws_ec2","aws_static","ec2.ini only"],
 ["Tags la groups?","keyed_groups","groups_by","tag_map"],
 ["Running servers mattum?","filters: instance-state-name","only_running","state: up"],
 ["Plugin ku Python lib?","boto3","requests","paramiko only"],
 ["Benefit?","IPs kai la update venaam","Faster SSH","No YAML"]],
[["Batch size?","serial","forks","batch"],
 ["Bad rollout stop?","max_fail_percentage","ignore_errors","retry"],
 ["Control node la odanum?","delegate_to: localhost","run_local","local: true"],
 ["DB migration orey thadava?","run_once","serial: 1","once: yes"],
 ["Parallel connections?","forks","threads","workers"]],
[["AWX na?","Ansible web UI / API","Terraform UI","Docker tool"],
 ["Runtime input?","Survey","Vault","Tag"],
 ["Role test framework?","Molecule","pytest only","Jest"],
 ["molecule test la idempotence?","2nd converge changed=0","Speed test","Lint"],
 ["Enterprise AWX?","Ansible Automation Platform","Ansible Pro","Tower Cloud"]]
];

return { lessons, practice, quiz };
};
