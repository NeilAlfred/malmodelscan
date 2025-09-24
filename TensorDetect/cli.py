import argparse
import re
import os
import sys
import model, scan
pattern = r'^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)' \
              r'(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?' \
              r'(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$'
              
def cli(args):
    if args.model:
        path = args.model
        if not os.path.exists(path):
            print("Invalid path!")
            return

        mod = model.Model(path)
        if mod.model_type == model.ModelType.TF_H5:
            sc = scan.H5Scan(mod)
        elif mod.model_type == model.ModelType.TF_SM:
            sc = scan.SavedModelScan(mod)
        sc.scan()
        sc.print_issues()
            
    else:
        print("Invalid arguments, please provide target model file path!")
        return


    

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Analyze Tensorflow API or detect malicious Tensorflow models(i.e., h5 or saved_model).")


    group2 = parser.add_argument_group("Malicious model detection group")
    # group2.add_argument("-d", "--detect", help="Model detection", default=1)
    group2.add_argument("-m", "--model", help="Tensorflow model path (i.e., h5 or saved_model)")

    args = parser.parse_args()
    
    # Ensure group1 or group2 parameters are provided as a full set
    if not (args.model):
        print("Error: Arguments -m must be used together.")
        sys.exit(1)
    

    cli(args)