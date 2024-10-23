import { useState } from 'react';
import './App.css';
import { useEffect } from 'react';
import { CiSearch } from "react-icons/ci";
import axios from 'axios';
import { PiPlus } from 'react-icons/pi';
import { Button, Modal } from 'react-bootstrap';
import { FaLayerGroup } from 'react-icons/fa';

function App() {
  const [search, setSearch] = useState("");

  const [data, setData] = useState(null || Array);
  const [loading, setLoading] = useState(true);

  const [filterData, setFilterData] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [Create, setCreate] = useState({
    name: "",
    string: "",
    upload: false,
    error: ""
  })

  const [evaluate, setEvaluate] = useState({
    ruleId: "",
    userData: "",
    modal: false,
    upload: false,
    error: ""
  })
  const [selectedRules, setSelectedRules] = useState([]);
  const [combineRule, setCombineRule] = useState({
    modal:false,
    title:"",
    upload:false,
    error:""
  });

  function handleCombineWindow(){
    setCombineRule({...combineRule, modal:!combineRule.modal, title:""});
  } 

  const handleRuleSelection = (id) => {
    setSelectedRules((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((ruleId) => ruleId !== id)
        : [...prevSelected, id]
    );
  };
  
  const getString = async () => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/get/rules`);
    const data = await response.data;
    setData(data.rules);
    setLoading(false);
  }

  const groupRules = async () => {
    try {
      if (selectedRules.length < 2) {
        window.alert("Select at least two rules to group.");
        return;
      }
      setCombineRule({...combineRule, error:"", upload:true});
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/combineRule`, {
        ruleIds: selectedRules,
        combinedName: combineRule.title
      });
      if(response.data.success){
        setCombineRule({...combineRule, modal:!combineRule.modal, title:""});
        getString();
      }else{
        setCombineRule({...combineRule, error:"Try Again!"});
      }
    } catch (error) {
      console.log(error);
      setCombineRule({...combineRule, error:"Try Again!"});
    }finally{
      setCombineRule({...combineRule, error:"", upload:false});
    }
  };


  function changeEvaluateModal(id = null) {
    setEvaluate({ ...evaluate, modal: !evaluate.modal, ruleId: id != null ? id : "" });
  }


  async function createNewRule() {
    try {
      setCreate({ ...Create, upload: true, error: "" });
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/create_rule`, {
        ruleString: Create.string,
        name: Create.name
      })
      let data = res.data;
      if (data.success) {
        setShowModal(false);
        getString();
        setCreate({ ...Create, name: "", string: "", upload: false, error: "" });
      } else {

        setCreate({ ...Create, upload: false, error: "Try Again!" });
      }
    } catch (error) {
      setCreate({ ...Create, upload: false, error: error.res.error || "Internal server Error" });
    } finally {
      setCreate({ ...Create, upload: false, error: "Internal server Error" });
    }
  }

  const isValidJson = (jsonString) => {
    // Regex to match a valid JSON structure (simple objects or arrays)
    const jsonRegex = /^[\],:{}\s]*$/
      .test(
        jsonString
          .replace(/\\["\\\/bfnrtu]/g, "@")
          .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
          .replace(/(?:^|:|,)(?:\s*\[)+/g, "")
      );

    return jsonRegex && (jsonString.trim().startsWith("{") || jsonString.trim().startsWith("["));
  };


  async function Evaluate() {
    try {
      // Start the evaluation process by setting upload state to true
      setEvaluate({ ...evaluate, upload: true, error: "" });

      // Check if a rule ID is provided
      if (evaluate.ruleId.length <= 0) {
        window.alert("Please select a rule to evaluate");
        setEvaluate({ ...evaluate, upload: false });
        return;
      }

      // Check if the user data is valid JSON
      let parsedUserData;
      try {
        parsedUserData = JSON.parse(Create.string);
      } catch (error) {
        window.alert("Please enter valid JSON for userData");
        setEvaluate({ ...evaluate, upload: false });
        return;
      }

      // Send the POST request to the evaluation API
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/evaluate_rule`, {
        ruleId: evaluate.ruleId,
        userData: parsedUserData
      });

      console.log("res.data", res.data);
      let data = res.data;

      // Check the response result and update the state accordingly
      if (data.result) {
        window.alert("Successfully Matched!");
        setEvaluate({ ...evaluate, modal: true, upload: false, error: "" });
        setCreate({ ...Create, name: "", string: "", upload: false, error: "" });
      } else {
        setEvaluate({ ...evaluate, modal: true, upload: false, error: "Doesn't Match/Evaluate!" });
      }
    } catch (e) {
      // Handle any errors that occur during the evaluation process
      setEvaluate({
        ...evaluate,
        upload: false,
        error: e.response?.data?.error || "Internal server error"
      });
    } finally {
      // Reset the upload state
      setEvaluate((prevState) => ({ ...prevState, upload: false }));
    }
  }


  function handleCreateValChange(e) {
    console.log(e);
    e.preventDefault();
    let name, val;
    name = e.target.name;
    val = e.target.value;
    console.log(name, val);
    setCreate({ ...Create, [name]: val });
  }

  function handleCloseModal() {
    setShowModal(false);
  }

  function handleOpenModal() {
    setCreate({ ...Create, name: "", string: "", upload: false, error: "" });
    setShowModal(true);
  }

  const HandleChange = (e) => {
    e.preventDefault();
    setSearch(e.target.value);
    if (data === null) return;
    const filteredData = data.filter((item) => {
      return item.name.includes(e.target.value)
    })
    setFilterData(filteredData);
  }




  useEffect(() => {
    getString();
  }, [])

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
       <nav className='flex items-center justify-between p-1 bg-black h-16'>
        <h1 className='text-white font-bold text-xl'>AST Rule Engine</h1>
        <div>
          <PiPlus color='white' onClick={handleOpenModal} />
          <FaLayerGroup color='white' />
        </div>
      </nav>
      <div className='p-2 w-full h-screen'>
        <div className='w-full border p-1 rounded-md h-full flex flex-col'>
          <h1 className='text-xl font-bold'>AST Strings</h1>
          <p className='text-sm text-gray-500'>View and manage your AST strings</p>
          <div className='w-full flex items-center my-3'>
            <input onChange={(e) => HandleChange(e)} placeholder='Search...' value={search} type="text" alt="search" id="search" className='w-full border p-1 rounded-md ' />
            <button className='border p-1 bg-black text-white rounded-md ml-2'><CiSearch size={24} /></button>
          </div>
          {selectedRules.length >= 2 && (
            <button className='border p-1 bg-black text-white rounded-md mb-2' onClick={handleCombineWindow}>
              Group Selected
            </button>
          )}
          <table className="table-fixed">
            <thead>
              <tr className='border-b-2 border-gray-500 '>
                <th className='font-semibold'>Select</th>
                <th className='font-semibold'>Name</th>
                <th className='font-semibold'>String</th>
                <th className='font-semibold'>Action</th>
              </tr>
            </thead>
            <tbody>
              {(filterData || data).map((item) => (
                <tr key={item._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRules.includes(item._id)}
                      onChange={() => handleRuleSelection(item._id)}
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.ruleString || "No String Available"}</td>
                  <td>
                    <button onClick={() => changeEvaluateModal(item._id)} className='border p-1 rounded-md ml-2'>Evaluate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal centered show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add A New String</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <span className='text-sm text-gray-500 mb-2'>Create a new AST String</span>
          <p className='text-sm font-semibold my-1'>Name</p>
          <input onChange={(e) => handleCreateValChange(e)} placeholder='Rule Name' value={Create.name} name="name" type="text" alt="name" id="name" className='w-full border p-1 rounded-md ' />
          <p className='text-sm font-semibold my-1'>String</p>
          <input onChange={(e) => handleCreateValChange(e)} placeholder='Rule String' value={Create.string} name="string" type="text" alt="string" id="string" className='w-full border p-1 rounded-md ' />
          <p className='text-red-500 text-xs'>{Create.error}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="dark" onClick={() => createNewRule()}>
            Add New Rule
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal centered show={combineRule.modal} onHide={handleCombineWindow}>
        <Modal.Header closeButton>
          <Modal.Title>Add A New Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <span className='text-sm text-gray-500 mb-2'>Add a name to to Combined Rule</span>
          <p className='text-sm font-semibold my-1'>Name</p>
          <input onChange={(e) => setCombineRule({ ...combineRule, title: e.target.value })} placeholder='Rule Name' value={combineRule.title} name="name" type="text" alt="name" id="name" className='w-full border p-1 rounded-md ' />
          <p className='text-red-500 text-xs'>{combineRule.error}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="dark" onClick={() => groupRules()}>
            Combine Rules
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal centered show={evaluate.modal} onHide={changeEvaluateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Evaluate A String</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className='text-sm font-semibold my-1'>String <span className='text-xs font-normal'>(use json format)</span></p>
          <textarea onChange={(e) => handleCreateValChange(e)} placeholder='Rule String' value={Create.string} name="string" type="text" alt="string" id="string" className='w-full border p-1 rounded-md ' >
          </textarea>
          <p className='text-red-500 text-xs'>{evaluate.error}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="dark" onClick={() => Evaluate()}>
            Evaluate String
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default App;
