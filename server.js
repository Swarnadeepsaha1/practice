const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const mysql = require('mysql2');

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'university'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        console.log("not connected");
    } else {
        console.log('MySQL connected...');
    }
});
const PORT = process.env.PORT || 3000;



app.post('/faculty/create', (req, res) => {
    const { name, dept, date_of_birth } = req.body;

    // Check if the department exists
    const checkDeptSql = 'SELECT * FROM Dept WHERE dept_name = ?';
    db.query(checkDeptSql, [dept], (err, results) => {
        if (err) {
            console.error('Error checking department:', err);
            res.status(500).send('Error checking department');
            return;
        }

        if (results.length === 0) {
            res.status(400).send('Department does not exist');
            return;
        }

        // If department exists, insert the faculty member
        const insertFacultySql = 'INSERT INTO Faculty (name, dept, date_of_birth) VALUES (?, ?, ?)';
        db.query(insertFacultySql, [name, dept, date_of_birth], (err, result) => {
            if (err) {
                console.error('Error inserting faculty:', err);
                res.status(500).send('Error inserting faculty');
                return;
            }
            res.send('Faculty member added successfully');
        });
    });
});

//API FACULTY FETCH BY ID
app.get('/faculty/:id', (req, res) => {
    const facultyId = req.params.id;

    // SQL query to fetch the faculty member by ID
    const getFacultySql = 'SELECT * FROM Faculty WHERE id = ?';
    db.query(getFacultySql, [facultyId], (err, results) => {
        if (err) {
            console.error('Error fetching faculty member:', err);
            res.status(500).send('Error fetching faculty member');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Faculty member not found');
            return;
        }

        res.json(results[0]);
    });
});

// Get All Faculty API
app.get('/faculty', (req, res) => {
    // SQL query to fetch all faculty members
    const getAllFacultySql = 'SELECT * FROM Faculty';
    db.query(getAllFacultySql, (err, results) => {
        if (err) {
            console.error('Error fetching faculty members:', err);
            res.status(500).send('Error fetching faculty members');
            return;
        }

        res.json(results);
    });
});

// Delete Faculty by ID API
app.delete('/faculty/delete/:id', (req, res) => {
    const facultyId = req.params.id;

    // SQL query to delete the faculty member by ID
    const deleteFacultySql = 'DELETE FROM Faculty WHERE id = ?';
    db.query(deleteFacultySql, [facultyId], (err, result) => {
        if (err) {
            console.error('Error deleting faculty member:', err);
            res.status(500).send('Error deleting faculty member');
            return;
        }

        if (result.affectedRows === 0) {
            res.status(404).send('Faculty member not found');
            return;
        }

        res.send('Faculty member deleted successfully');
    });
});

// create class
app.post('/class/create', (req, res) => {
    const { faculty_id, no_of_students, no_of_days, dept } = req.body;

    // Check if the department exists
    const checkDeptSql = 'SELECT * FROM Dept WHERE dept_name = ?';
    db.query(checkDeptSql, [dept], (err, deptResults) => {
        if (err) {
            console.error('Error checking department:', err);
            res.status(500).send('Error checking department');
            return;
        }

        if (deptResults.length === 0) {
            res.status(400).send('Department does not exist');
            return;
        }

        // Check if the faculty exists and belongs to the same department
        const checkFacultySql = 'SELECT * FROM Faculty WHERE id = ? AND dept = ?';
        db.query(checkFacultySql, [faculty_id, dept], (err, facultyResults) => {
            if (err) {
                console.error('Error checking faculty:', err);
                res.status(500).send('Error checking faculty');
                return;
            }

            if (facultyResults.length === 0) {
                res.status(400).send('Faculty does not exist or does not belong to the specified department');
                return;
            }

            // If department and faculty check out, insert the class
            const insertClassSql = 'INSERT INTO Class (faculty_id, no_of_students, no_of_days, dept) VALUES (?, ?, ?, ?)';
            db.query(insertClassSql, [faculty_id, no_of_students, no_of_days, dept], (err, result) => {
                if (err) {
                    console.error('Error inserting class:', err);
                    res.status(500).send('Error inserting class');
                    return;
                }
                res.send('Class added successfully');
            });
        });
    });
});

// Get Classes by Faculty ID API
app.get('/class/faculty/:faculty_id', (req, res) => {
    const facultyId = req.params.faculty_id;

    // SQL query to fetch classes by faculty ID
    const getClassesByFacultySql = 'SELECT * FROM Class WHERE faculty_id = ?';
    db.query(getClassesByFacultySql, [facultyId], (err, results) => {
        if (err) {
            console.error('Error fetching classes:', err);
            res.status(500).send('Error fetching classes');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('No classes found for the specified faculty ID');
            return;
        }

        res.json(results);
    });
});
// Get All Classes API
app.get('/class', (req, res) => {
    // SQL query to fetch all classes
    const getAllClassesSql = 'SELECT * FROM Class';
    db.query(getAllClassesSql, (err, results) => {
        if (err) {
            console.error('Error fetching classes:', err);
            res.status(500).send('Error fetching classes');
            return;
        }

        res.json(results);
    });
});

// Delete Classes by Faculty ID API
app.delete('/class/faculty/:faculty_id', (req, res) => {
    const facultyId = req.params.faculty_id;

    // SQL query to delete classes by faculty ID
    const deleteClassesByFacultySql = 'DELETE FROM Class WHERE faculty_id = ?';
    db.query(deleteClassesByFacultySql, [facultyId], (err, result) => {
        if (err) {
            console.error('Error deleting classes:', err);
            res.status(500).send('Error deleting classes');
            return;
        }

        if (result.affectedRows === 0) {
            res.status(404).send('No classes found for the specified faculty ID');
            return;
        }

        res.send('Classes deleted successfully');
    });
});



// Create (Insert) a new department with a check for existing department
app.post('/dept/create', (req, res) => 
{
    const { dept_name } = req.body;

    // Check if the department already exists
    const checkDeptSql = 'SELECT * FROM Dept WHERE dept_name = ?';
    db.query(checkDeptSql, [dept_name], (err, results) => {
        if (err) {
            console.error('Error checking department:', err);
            res.status(500).send('Error checking department');
            return;
        }

        if (results.length > 0) {
            res.status(400).send('Department already exists');
            return;
        }

        // If department does not exist, insert the new department
        const insertDeptSql = 'INSERT INTO Dept (dept_name) VALUES (?)';
        db.query(insertDeptSql, [dept_name], (err, result) => {
            if (err) {
                console.error('Error inserting department:', err);
                res.status(500).send('Error inserting department');
                return;
            }
            res.send('Department added successfully');
        });
    });
});

// Get All Departments API
app.get('/dept', (req, res) => {
    // SQL query to fetch all departments
    const getAllDeptsSql = 'SELECT * FROM Dept';
    db.query(getAllDeptsSql, (err, results) => {
        if (err) {
            console.error('Error fetching departments:', err);
            res.status(500).send('Error fetching departments');
            return;
        }

        res.json(results);
    });
});


// Get Department by ID API
app.get('/dept/:id', (req, res) => {
    const deptId = req.params.id;

    // SQL query to fetch the department by ID
    const getDeptByIdSql = 'SELECT * FROM Dept WHERE id = ?';
    db.query(getDeptByIdSql, [deptId], (err, results) => {
        if (err) {
            console.error('Error fetching department:', err);
            res.status(500).send('Error fetching department');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Department not found');
            return;
        }

        res.json(results[0]);
    });
});

// Delete Department by ID API
app.delete('/dept/:id', (req, res) => {
   
    const deptId = req.params.id;

    // SQL query to delete the department by ID
    const deleteDeptByIdSql = 'DELETE FROM Dept WHERE id = ?';
    db.query(deleteDeptByIdSql, [deptId], (err, result) => {
        if (err){
            console.error('Error deleting department:', err);
            res.status(500).send('Error deleting department');
            return;
        }

        if (result.affectedRows === 0) {
            res.status(404).send('Department not found');
            return;
        }

        res.send('Department deleted successfully');
    });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
