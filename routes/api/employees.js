const router = require('express').Router();
const db = require('../../config/connection');


router.get('/', (req, res) => {
    const query = 'SELECT * FROM employees;'

    db.query(query, (err,data)=>{
        if(err){
            res.status(500).json({error:'you messed up!'});
            return;
        }
            res.json(data);
        });

});


router.post('/', (req, res)=>{
    const query = 'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?)'

    db.query(query, [req.body.first_name, req.body.last_name, req.body.role_id, req.body.manager_id], (err,data)=>{
        if(err){
            res.status(500).json({error:'you messed up'});
            return;
        }
            res.json(data);
        })
});


router.put('/:id', (req,res)=>{

    const query = 'UPDATE employees SET first_name=? WHERE id=?';

    db.query(query, [req.body.first_name, req.params.id], (err,data)=>{
        if(err){
            res.status(500).json({error:'you messed up'});
            return;
        }
        res.json(data)
    })

});

router.delete("/:id", (req, res)=>{
    const query = 'DELETE FROM employees WHERE id=?';

    db.query(query, req.params.id, (err,data)=>{
        if(err){
            res.status(500).json({error:'you messed up'});
            return;
        }
        res.json(data);
    })
});



module.exports = router;