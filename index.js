const express=require("express")

let app=express();
const bodyParser=require('body-parser');

app.use(bodyParser.json());

let halls=[]
let customers=[]
let bookings=[]
//get all data regarding hall
app.get("/halls",(req,res)=>{
    res.json(halls);
})

app.post("/add-hall",(req,res)=>{
    req.body.id=halls.length+1;
    halls.push(req.body);
    res.json({
        "Message":"Hall Added successfully"
    })
})

app.get("/hall/:id",(req,res)=>{
    let hall=halls.find(ele=>ele.id == req.params.id)
    if(hall)
    {
        res.json(hall)
    }else{
        res.send(500).json({
            "Message":"Hall Not Found"
        })
    }
});

app.put("/hall/:id",(req,res)=>{
    let hall=halls.find(ele=>ele.id == req.params.id)
    if(hall)
    {
        if(req.body.name)
        {
            hall.name=req.body.name;
        }
        if(req.body.area_in_sqft)
        {
            hall.area_in_sqft=req.body.area_in_sqft;
        }
        if(req.body.no_of_seats)
        {
            hall.no_of_seats=no_of_seats;
        }
        if(req.body.price_per_hour)
        {
            hall.price_per_hour=req.body.price_per_hour;
        }

        res.json({
            "message":"Record Updated Sucessfully"
        })
    }
    res.status(404).json({
        "Failed":"Record Not found"
    })
})
app.delete("/hall/:id",(req,res)=>{
    let hallindex=halls.findIndex(ele=>ele.id == req.params.id)
    if(hallindex!=-1)
    {
        halls[hallindex]={}
        res.json({
            "Message":"Hall Deleted "
        })

    }
    else{
        res.status(404).json({
            "filed":"Record not Found"
        })
    }
})


//Customers

app.get("/customers",(req,res)=>{
    res.json(customers)
})

app.post("/add-customer",(req,res)=>{
    req.body.id=customers.length+1;
    customers.push(req.body)
    res.json({
        "Message":"customer Added"
    })
})

app.get("/customer/:id",(req,res)=>{
    let customer=customers.find(ele=>ele.id==req.params.id)
    if(customer)
    {
        res.json(customer)
    }
    else{
        res.status(404).json({
            "Message":"Record Not Found"
        })
    }
})

app.put("/customer/:id",(req,res)=>{
    let ind=customers.find(ele=>ele.id==req.params.id)
    if(ind)
    {
        if(req.body.name)
        {
            ind.name=req.body.name;
        }
        if(req.body.email)
        {
            ind.email=req.body.email;
        }
        if(req.body.phone)
        {
            ind.phone=req.body.phone;
        }
        res.json({
            "message":"Updated"
        })
    }
    else{
        res.status(404).json({
            "Failed":"Record Not Found"
        })
    }
})

app.delete("/customer/:id",(req,res)=>{
    let index=customers.findIndex(ele=>ele.id==req.params.id)
    if(index!=-1)
    {
        customers[index]={}
        res.json({
            "message":"Record is Deleted"
        })
    }
    else{
        res.status(404).json({
            "message":"Record Not Found"
        })
    }
})


app.post("/hallbooking", (req, res) => {
    let dateTime = req.body.startDateAndTime.split(' ');
    let curDate = dateTime[0].split("/");
    let check = new Date(curDate[2], parseInt(curDate[1]) - 1, curDate[0]);
    let available = true;
    for (booking of bookings) {
        let date1 = booking.startDateAndTime.split(" ");
        date1 = date1[0].split("/");
        let date2 = booking.endDateAndTime.split(" ");
        date2 = date2[0].split("/");
        let from = new Date(date1[2], parseInt(date1[1]) - 1, date1[0]);
        let to = new Date(date2[2], parseInt(date2[1]) - 1, date2[0]);
        if (check >= from && check <= to) {
            available = false;
            break;
        }
    }
    if (available) {
        let startDate = new Date(`${curDate[1]}/${curDate[0]}/${curDate[2]} ${dateTime[1]}`).getTime();
        dateTime = req.body.endDateAndTime.split(' ');
        let last = dateTime[0].split("/");
        let endDate = new Date(`${last[1]}/${last[0]}/${last[2]} ${dateTime[1]}`).getTime();
        let hours = ((Math.abs(endDate - startDate)) / (1000 * 60 * 60)).toFixed(1);
        req.body.id = bookings.length + 1;
        req.body.totalHours = hours;
        bookings.push(req.body);
        res.json({
            "success": "Hall Booked"
        });
    } else {
        res.json({
            "failed": "Hall is already booked!"
        });
    }
});


app.get("/booking/user/:id", (req, res) => {
    let customer = customers.find(obj => obj.id == req.params.id);
    if (customer) {
        let customerBookings = [];
        bookings.map(obj => {
            if (obj.customer_id == req.params.id) {
                let hall = halls.find(hall => hall.id == obj.hall_id);
                customerBookings.push({
                    hall_name: hall.name,
                    startDateAndTime: obj.startDateAndTime,
                    endDateAndTime: obj.endDateAndTime,
                    amount: +obj.totalHours * hall.price_per_hour
                });
            }
        });
        if (customerBookings.length > 0) {
            res.json({
                customer,
                customerBookings
            });
        } else {
            res.json({
                customer,
                "status": "No Booking made"
            });
        }
    } else {
        res.status(404).json({
            "failed": "No Customer Found"
        });
    }
});

app.get("/booking/hall/:id", (req, res) => {
    let hall = halls.find(obj => obj.id == req.params.id);
    if (hall) {
        let hallBookings = [];
        bookings.map(obj => {
            if (obj.hall_id == req.params.id) {
                let customer = customers.find(ele => ele.id == obj.customer_id);
                hallBookings.push({
                    customer: customer,
                    startDateAndTime: obj.startDateAndTime,
                    endDateAndTime: obj.endDateAndTime,
                    amount: +obj.totalHours * hall.price_per_hour
                });
            }
        });
        if (hallBookings.length > 0) {
            res.json({
                hall,
                hallBookings
            });
        } else {
            res.json({
                hall,
                "status": "No Booking made"
            });
        }
    } else {
        res.status(404).json({
            "failed": "No Hall Found"
        });
    }
});

app.listen(3000,(console.log("Server is Running on port number 3000")))