import {NavLink} from 'react-router-dom'

function navbar(){
    return(
        <>
        <nav className='sidenav'>
          <NavLink to='/'>Dashboard</NavLink>
          <NavLink to='/setAllowance'>Set Allowance</NavLink>
          <NavLink to='/sendMoney'>Send Money</NavLink>

        </nav>
        </>
    )
}


export default navbar;

