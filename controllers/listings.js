const Listing = require("../models/listing");

module.exports.index = async (req,res)=>{
     const allListing = await Listing.find({});
     res.render("listings/index.ejs",{allListing});
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs")
};

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const listings = await Listing.findById(id)
    .populate({path:"reviews",populate:{
        path:"author",
    }})
    .populate("owner");
    if(!listings){
        req.flash("error","Listing you requested for does not exist !");
        res.redirect("/lisings");
    }
    // console.log(listings);
    res.render("listings/show.ejs",{listings});
};

module.exports.createListing = async (req,res,next)=> { 
  let url = req.file.path;
  let filename = req.file.filename;
  console.log(url,"..",filename);
  
  const  newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = {url,filename};
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
};

module.exports.editListing = async (req,res)=>{
    let {id} = req.params;
    const listings = await Listing.findById(id);
    if(!listings){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }

    let originalImageUrl = listings.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listings,originalImageUrl });
};

module.exports.updateListing = async (req,res)=>{
     if(!req.body.listing){
        throw new ExpressError(404,"send valid data for listing");
    }
     let {id} = req.params;
     let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url,filename};
    await listing.save();
    }
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};
