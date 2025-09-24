import argparse
import re
import os
import sys
from TensorDetect import TDmodel, TDscan
pattern = r'^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)' \
              r'(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?' \
              r'(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$'
              
def main(args):
    if args.model:
        path = args.model
        if not os.path.exists(path):
            print("Invalid path!")
            return

        mod = TDmodel.Model(path)
        if mod.model_type != TDmodel.ModelType.NOT_TF:
            print("\nTensorFlow format is detected, using TensorDetect...\n")
            if mod.model_type == TDmodel.ModelType.TF_H5:
                sc = TDscan.H5Scan(mod)
            elif mod.model_type == TDmodel.ModelType.TF_SM:
                sc = TDscan.SavedModelScan(mod)
            sc.scan()
            sc.print_issues()
        else:
            print("\nNot a TensorFlow format, using ModelScan...\n")
            from modelscan.modelscan import ModelScan
            from modelscan.settings import DEFAULT_SETTINGS

            # Initialize ModelScan with default settings
            scanner = ModelScan(settings=DEFAULT_SETTINGS)


            # Scan a model file or directory 
            results = scanner.scan(args.model)


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
            
    else:
        print("Invalid arguments, please provide target model file path!")
        return


    

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Use TensorDetect to analyze Tensorflow API or detect malicious Tensorflow models(i.e., h5 or saved_model), or use ModelScan to analyze other types of models (i.e., .pkl or .bin)")


    group2 = parser.add_argument_group("Malicious model detection")
    # group2.add_argument("-d", "--detect", help="Model detection", default=1)
    group2.add_argument("-m", "--model", help="Tensorflow (or other types of) model's path (i.e., h5, pickle or saved_model)")

    args = parser.parse_args()
    
    # Ensure group1 or group2 parameters are provided as a full set
    if not (args.model):
        print("Error: Arguments -m must be used together.")
        sys.exit(1)
    

    main(args)