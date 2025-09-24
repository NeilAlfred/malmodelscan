from modelscan.modelscan import ModelScan
from modelscan.settings import DEFAULT_SETTINGS

# Initialize ModelScan with default settings
scanner = ModelScan(settings=DEFAULT_SETTINGS)


# Scan a model file or directory 
results = scanner.scan("/home/neil/code/malmodel_scan/TensorDetect/demo_models/tensorabuse_savedmodel/saved_model.pb")


# Check if issues were found
if scanner.issues.all_issues:
    print(f"Found {len(scanner.issues.all_issues)} issues!")
    
    # Access issues by severity
    issues_by_severity = scanner.issues.group_by_severity()
    for severity, issues in issues_by_severity.items():
        print(f"{severity}: {len(issues)} issues")

else:
    print("None!")
        
# Generate a report (default is console output)
scanner.generate_report()