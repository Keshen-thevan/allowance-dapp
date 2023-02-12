import {NavLink} from 'react-router-dom'

function navbar(){
    return(
        <>
        <nav className='sidenav'>
          <NavLink to='/'>Dashboard</NavLink>
          <NavLink to='/userWithdraw'>Withdraw</NavLink>
          <NavLink to='/userSendMoney'>Send Money</NavLink>
          <NavLink to='/stake'>Stake</NavLink>
          <NavLink to='/mint'>Mint</NavLink>
        </nav>
        </>
    )
}


export default navbar;

