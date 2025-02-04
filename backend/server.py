from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import traceback
import os
import matplotlib.pyplot as plt
from sklearn.datasets import load_iris
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn import tree

app = Flask(__name__, static_folder="static")
CORS(app)

# Node class for the decision tree
class Node:
    def __init__(self, attribute):
        self.attribute = attribute
        self.children = []
        self.answer = ""

    def __str__(self):
        return self.attribute

@app.route('/')
def home():
    return "Flask server is running. Use /execute to POST your data."

@app.route('/execute', methods=['POST'])
def execute_code():
    try:
        file = request.files.get('file')
        selected_code = request.form.get('selectedCode')

        if not file or not selected_code:
            return jsonify({'output': 'Please select a code and upload a file.'}), 400

        selected_code = selected_code.strip().lower()

        # Handle missing or invalid selectedCode
        if selected_code not in ['id3_algorithm', 'candidate-elimination', 'find-s']:
            return jsonify({'output': 'Invalid code selection'}), 400

        if selected_code == 'id3_algorithm':
            # Load and process the Iris dataset
            data_iris = load_iris()
            df_iris = pd.DataFrame(data_iris.data, columns=data_iris.feature_names)
            df_iris['target'] = data_iris.target

            X_train, X_test, y_train, y_test = train_test_split(df_iris[data_iris.feature_names], df_iris['target'])
            clf_iris = DecisionTreeClassifier(criterion="entropy", max_depth=5)
            clf_iris.fit(X_train, y_train)

            # Visualize the decision tree for the Iris dataset
            fn = data_iris.feature_names
            cn = data_iris.target_names

            # Ensure the directory exists for saving the image
            if not os.path.exists('static/images'):
                os.makedirs('static/images')

            # Save image to the 'static/images' directory
            img_path = 'static/images/iris_tree.png'
            fig, axes = plt.subplots(nrows=1, ncols=1, figsize=(10, 10), dpi=300)
            tree.plot_tree(clf_iris, feature_names=fn, class_names=cn, filled=True)
            fig.savefig(img_path)

            # Predictions for the Iris dataset
            y_pred_iris = clf_iris.predict(X_test)

            output = {
                'message': 'Iris decision tree generated successfully.',
                'image_url': img_path
            }

        elif selected_code == 'candidate-elimination':
    # Read CSV file into a pandas DataFrame
            try:
                data = pd.read_csv(file)
            except Exception as e:
                return jsonify({'output': f"Error reading CSV file: {str(e)}"}), 400

            # Extract attributes and target variable
            attr = np.array(data)[:, :-1]  # Features (all columns except last)
            target = np.array(data)[:, -1]  # Target column (last column)

            # Implement Candidate Elimination algorithm
            def learn(attr, target):
                s = attr[0].copy()  # Start with the first instance as specific hypothesis
                g = [['?' for _ in range(len(s))] for _ in range(len(s))]  # General hypothesis

                # Update the specific and general hypotheses
                for i, h in enumerate(attr):
                    if target[i] in ["YES", "Yes", "yes"]:
                        for x in range(len(s)):
                            if h[x] != s[x]:
                                s[x] = '?'  # Generalize specific hypothesis
                                g[x][x] = '?'  # Generalize corresponding general hypothesis
                    elif target[i] in ["NO", "No", "no"]:
                        for x in range(len(s)):
                            if h[x] != s[x]:
                                g[x][x] = s[x]  # Specialize general hypothesis
                            else:
                                g[x][x] = '?'  # Retain '?' for non-matching features

                # Remove redundant hypotheses from general hypothesis set
                g = [hypo for hypo in g if hypo != ['?' for _ in range(len(s))]]

                return s, g

            # Execute the learning algorithm
            s_f, g_f = learn(attr, target)

            # Format output
            s_f = s_f.tolist()  # Convert specific hypothesis to list
            # g_f = [g.tolist() for g in g_f] 
            output = {
                'Specific Hypothesis': s_f,
                'General Hypotheses': g_f
            }

        elif selected_code == 'find-s':
            # Find-S algorithm (same implementation as before)
            df = pd.read_csv(file)

            # Print the dataset for debuggin

            # Split features
            attr = np.array(df)[:,:-1]
            #print("The attributes are: ")
            #print(attr)

            # Split target
            target = np.array(df)[:,-1]
            hypo = None

            for i, val in enumerate(target):
                if val in ["YES", "Yes", "yes", 1]:
                    hypo = attr[i].copy()
                    break

            if hypo is None:
                return jsonify({'output': "Error: No positive examples found in the dataset."}), 400

            # Update the specific hypothesis
            for i, val in enumerate(attr):
                if target[i] in ["YES", "Yes", "yes", 1]:
                    for x in range(len(hypo)):
                        if val[x] != hypo[x]:
                            hypo[x] = '?'  # Generalize differing attributes
            hypo_str = [str(h) for h in hypo]
            output = {
                    'message': 'Most specific hypothesis is:',
                    'hypothesis': hypo_str  # Send it as a list
                }

        return jsonify({'output': output})

    except Exception as e:
        error_message = str(e)
        print("Error details:", error_message)
        print("Stack trace:", traceback.format_exc())  # Print the stack trace for debugging
        return jsonify({'output': f"Error: {error_message}"}), 500

if __name__ == "__main__":
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)

