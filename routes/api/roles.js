const router = require('express').Router();
const db = require('../../config/connection');


router.get('/', (req, res) => {
    const query = 'SELECT * FROM roles;'

    db.query(query, (err,data)=>{
        if(err){
            res.status(500).json({error:'you messed up!'});
            return;
        }
            res.json(data);
        });

});

router.post('/', (req, res)=>{
    const query = 'INSERT INTO roles (title, salary, department_id) VALUES (?)'

    db.query(query, [req.body.title, req.body.salary, req.body.department_id], (err,data)=>{
        if(err){
            res.status(500).json({error:'you messed up'});
            return;
        }
            res.json(data);
        })
});

router.delete("/:id", (req, res)=>{
    const query = 'DELETE FROM roles WHERE id=?';

    db.query(query, req.params.id, (err,data)=>{
        if(err){
            res.status(500).json({error:'you messed up'});
            return;
        }
        res.json(data);
    })
});

module.exports = router;