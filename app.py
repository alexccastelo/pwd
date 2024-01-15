from flask import Flask, request, render_template
import random

app = Flask(__name__)
app.secret_key = (
    "WMEZQUBKb%z69GRknDvFoj^@3CXgt#sS1pJ5*l(d8A2&0!Yure)xPh4a7VNHTOyqmcwfI$iL"
)


@app.route("/", methods=["GET", "POST"])
def form():
    password = ""
    if request.method == "POST":
        lower = "abcdefghijklmnopqrstuvwxyz" if "lower" in request.form else ""
        upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" if "upper" in request.form else ""
        numbers = "0123456789" if "numbers" in request.form else ""
        symbols = "!@#$%^&*()" if "symbols" in request.form else ""
        all = lower + upper + numbers + symbols
        length = int(request.form.get("length", 8))
        password = "".join(random.sample(all, k=length))
    return render_template("form.html", password=password)


if __name__ == "__main__":
    app.run(debug=True)
