const registerUser = async (req, res) => {
    res.send("registered");
}

const getUser = async (req, res) => {
    res.send(`User ID: ${req.params.id}`);
}


export {
    registerUser,
    getUser
}