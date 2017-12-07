pragma solidity ^0.4.0;

contract ue_contract{
    struct student{
        string name;
        address addr;
    }

    address resp_addr;
    string resp_name;
    string name;
    uint16 total_places;
    student[] enrolled_students;
    student[] pending_students;

    function enroll(string student_name) returns (bool){
        if(total_places > 0){
            pending_students.push(student(student_name,msg.sender));
            return true;
        }else{
            return false;
        }
    }

    function validate_enroll(address student_addr){
        require(msg.sender == resp_addr);
        require(total_places > 0);
        uint len = pending_students.length;
        for(uint i = 0;i<len; i++){
            if(pending_students[i].addr == student_addr){
                enrolled_students.push(pending_students[i]);
                pending_students[i] = pending_students[len-1];
                delete pending_students[len-1];
                pending_students.length--;
                total_places--;
            }
        }

    }

    function get_ue_name() returns (string){
        return name;
    }

    function get_total_places() returns (uint16){
        return total_places;
    }

    function get_number_of_enrolled_students() returns (uint){
        require(msg.sender == resp_addr);
        return enrolled_students.length;
    }

    function get_enrolled_students(uint index) returns (string,address){
        require(msg.sender == resp_addr);
        require(index>=0 && index < enrolled_students.length);
        return (enrolled_students[index].name, enrolled_students[index].addr);
    }

    function get_number_of_pending_students() returns (uint){
        require(msg.sender == resp_addr);
        return pending_students.length;
    }

    function get_pending_students(uint index) returns (string,address){
        require(msg.sender == resp_addr);
        require(index>=0 && index < pending_students.length);
        return (pending_students[index].name, pending_students[index].addr);
    }

    function ue_contract(string responsible_name, string ue_name, uint16 ue_total_places){
        resp_addr = msg.sender;
        resp_name = responsible_name;
        name = ue_name;
        total_places = ue_total_places;
    }
}
