var express = require("express");
var bodyParser = require("body-parser");
var validator = require("validator");
const mongoose = require('mongoose');
const mailchimp = require("@mailchimp/mailchimp_transactional")("YOUR_API_KEY");

mongoose.connect('mongodb://localhost:27017/iServiceDB', {
    useNewUrlParser: true
});

var db = mongoose.connection;
db.on('error', console.log.bind(console, "DB Connection error"));
db.once('open', function (callback) {
    console.log("DB connection succeeded");
})

const requesterSchema = new mongoose.Schema(
    {
        country: {
            type: String,
            required: [true, 'Country field required'],
        },
        firstName: {
            type: String,
            required: [true, 'First name field required'],
            trim: true
        },
        lastName: {
            type: String,
            required: [true, 'Last name field required'],
            trim: true
        },
        email: {
            type: String,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) { throw new Error('The email is not valid!') }
            }
        },
        password: {
            type: String,
            required: [true, 'Password required'],
            minlength: [8, 'Minimun password length 8 characters']
        },
        confirmPassword: {
            type: String,
            required: [true, 'Confirm Password field required'],
            minlength: [8, 'Minimun password length 8 characters']
        },
        addressLine1: {
            type: String,
            required: [true, 'Address required'],
        },
        addressLine2: {
            type: String
        },
        city: {
            type: String,
            required: [true, 'City required']
        },
        state: {
            type: String,
            required: [true, 'State required']
        },
        zipcode: {
            type: String
        },
        phone: {
            type: String
        }
    }
)

const Requester = mongoose.model("requesters", requesterSchema)

var app = express()

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.post('/sign_up', function (req, res) {
    var country = req.body.country;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;
    var password = req.body.password;
    var confirmPassword = req.body.confirmPassword;
    var addressLine1 = req.body.addressLine1;
    var addressLine2 = req.body.addressLine2;
    var city = req.body.city;
    var state = req.body.state;
    var zipcode = req.body.zipcode;
    var phone = req.body.phone;

    if (password != confirmPassword) {
        throw new Error("Passwords are not same");
    }

    const requester = new Requester(
        {
            country: country,
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            confirmPassword: confirmPassword,
            addressLine1: addressLine1,
            addressLine2: addressLine2,
            city: city,
            state: state,
            zipcode: zipcode,
            phone: phone
        }
    )

    requester.save(async (err) => {
        if (err) {
            console.log(err);
            res.send("Error")
        }
        else {
            const message = {
                from_email: "hello@example.com",
                subject: "Welcome Mail",
                text: "Welcome to iService!",
                to: [
                    {
                        email: email,
                        type: "to"
                    }
                ]
            };
            const response = await mailchimp.messages.send({ message });
            
            console.log("Success");
            res.send("Registration successful");
        }
    });
})


app.get('/', function (req, res) {
    return res.redirect('./index.html');
});

app.listen(3000, () => {
    console.log("Server listening at port 3000");
});